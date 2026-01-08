const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { getPool } = require('./db');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

/**
 * Helper to sign a JWT for a user.  The payload contains the user
 * id, username and role.  The secret and expiry come from environment
 * variables or defaults.  Including the role in the token allows
 * downstream routes to authorize based on user role without an
 * additional database lookup.
 *
 * @param {{ id: number, username: string, role: string }} user
 * @returns {string} JWT token
 */
function signToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || 'member'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function authRequired(req, res, next) {
  const header = req.headers['authorization'];
  let token = null;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

function librarianRequired(req, res, next) {
  if (!req.user || (req.user.role !== 'librarian' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * Calculate late fee for an overdue book.
 * Formula: Rp. 2000 for the first day late, + Rp. 1000 per additional day
 * 
 * @param {Date|string} dueDate - The due date of the loan
 * @param {Date|string|null} returnDate - The return date (null for current date)
 * @returns {number} The calculated late fee in Rupiah
 */
function calculateLateFee(dueDate, returnDate = null) {
  const due = new Date(dueDate);
  const returned = returnDate ? new Date(returnDate) : new Date();

  const daysOverdue = Math.floor((returned - due) / (1000 * 60 * 60 * 24));

  if (daysOverdue <= 0) {
    return 0;
  }

  const lateFee = 2000 + ((daysOverdue - 1) * 1000);
  
  return lateFee;
}

// -----------------------------------------------------------------------------
// Database health check
// -----------------------------------------------------------------------------
app.get('/health/db', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.json({ ok: rows[0]?.ok === 1 });
  } catch (e) {
    console.error('DB health check failed:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// -----------------------------------------------------------------------------
// User routes
// -----------------------------------------------------------------------------
app.get('/users', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, username, created_at FROM users ORDER BY id');
    return res.json(rows);
  } catch (e) {
    console.error('Error fetching users:', e);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const pool = getPool();
    const [[existing]] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [username, email || null, hashed]
    );
    return res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (e) {
    console.error('Registration error:', e);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.put('/users/:id', authRequired, adminRequired, async (req, res) => {
  const userId = Number(req.params.id);
  const { username, email, role, is_active } = req.body;
  const pool = getPool();
  try {
    const allowedRoles = ['member', 'librarian', 'admin'];
    let setClause = [];
    let values = [];
    if (username !== undefined) {
      setClause.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      setClause.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      setClause.push('role = ?');
      values.push(role);
    }
    if (is_active !== undefined) {
      setClause.push('is_active = ?');
      values.push(!!is_active);
    }
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    values.push(userId);
    const [result] = await pool.query(
      `UPDATE users SET ${setClause.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('Update user error:', e);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', authRequired, adminRequired, async (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id === userId) {
    return res.status(400).json({ error: 'Administrators cannot delete themselves' });
  }
  const pool = getPool();
  try {
    const [result] = await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('Delete user error:', e);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    const token = signToken({ id: user.id, username: user.username, role: user.role });
    if (process.env.USE_COOKIE_AUTH === 'true') {
      res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    }
    return res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// -----------------------------------------------------------------------------
// Book routes
// -----------------------------------------------------------------------------
app.post('/books', authRequired, librarianRequired, async (req, res) => {
  const {
    title,
    subtitle,
    description,
    isbn_10,
    isbn_13,
    language_code,
    page_count,
    release_date,
    publisher_id,
    cover_url,
    author_ids = [],
    genre_ids = []
  } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO books (title, subtitle, description, isbn_10, isbn_13, language_code, page_count, release_date, publisher_id, cover_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [title, subtitle || null, description || null, isbn_10 || null, isbn_13 || null, language_code || null, page_count || null, release_date || null, publisher_id || null, cover_url || null]
    );
    const bookId = result.insertId;
    if (Array.isArray(author_ids) && author_ids.length > 0) {
      const values = author_ids.map((aid, idx) => [bookId, aid, idx + 1]);
      await conn.query('INSERT INTO book_authors (book_id, author_id, author_order) VALUES ?', [values]);
    }
    if (Array.isArray(genre_ids) && genre_ids.length > 0) {
      const values = genre_ids.map(gid => [bookId, gid]);
      await conn.query('INSERT INTO book_genres (book_id, genre_id) VALUES ?', [values]);
    }
    await conn.commit();
    return res.status(201).json({ id: bookId });
  } catch (e) {
    await conn.rollback();
    console.error('Create book error:', e);
    return res.status(500).json({ error: 'Create book failed' });
  } finally {
    conn.release();
  }
});

app.get('/books', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const sort = req.query.sort || 'title_asc';
  const offset = (page - 1) * limit;
  
  const pool = getPool();
  try {
    let orderBy = 'b.title ASC';
    switch (sort) {
      case 'title_asc':
        orderBy = 'b.title ASC';
        break;
      case 'title_desc':
        orderBy = 'b.title DESC';
        break;
      case 'release_date_asc':
        orderBy = 'b.release_date ASC';
        break;
      case 'release_date_desc':
        orderBy = 'b.release_date DESC';
        break;
      case 'popularity_asc':
        orderBy = 'ar.avg_rating ASC';
        break;
      case 'popularity_desc':
        orderBy = 'ar.avg_rating DESC';
        break;
    }
    
    const [rows] = await pool.query(
      `SELECT b.*, ar.avg_rating, ar.rating_count
       FROM books b
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM books');
    const total = countResult[0].total;
    
    return res.json({
      books: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    console.error('Get books error:', e);
    return res.status(500).json({ error: 'Failed to fetch books' });
  }
});

app.get('/books/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const pool = getPool();
  try {
    if (!q) {
      const [rows] = await pool.query(
        `SELECT b.*, ar.avg_rating, ar.rating_count,
                COUNT(bc.id) as total_copies,
                SUM(CASE WHEN bc.is_available = TRUE THEN 1 ELSE 0 END) as available_copies
         FROM books b
         LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
         LEFT JOIN book_copies bc ON bc.book_id = b.id
         GROUP BY b.id
         ORDER BY b.created_at DESC LIMIT 50`
      );
      return res.json(rows);
    }

    const attr = (req.query.attribute || '').toLowerCase();
    let sql;
    let params;
    if (attr === 'title') {
      sql = `SELECT DISTINCT b.*, ar.avg_rating, ar.rating_count, COALESCE(f.cnt,0) AS favorites_count,
                    COUNT(bc.id) as total_copies,
                    SUM(CASE WHEN bc.is_available = TRUE THEN 1 ELSE 0 END) as available_copies
             FROM books b
             LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
             LEFT JOIN (
               SELECT book_id, COUNT(*) AS cnt FROM favorites GROUP BY book_id
             ) f ON f.book_id = b.id
             LEFT JOIN book_copies bc ON bc.book_id = b.id
             WHERE (MATCH(b.title, b.subtitle, b.description) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR b.title LIKE CONCAT('%', ?, '%')
             GROUP BY b.id
             ORDER BY ar.avg_rating DESC, b.title ASC
             LIMIT 100`;
      params = [q, q];
    } else if (attr === 'author') {
      sql = `SELECT DISTINCT b.*, ar.avg_rating, ar.rating_count, COALESCE(f.cnt,0) AS favorites_count,
                    COUNT(bc.id) as total_copies,
                    SUM(CASE WHEN bc.is_available = TRUE THEN 1 ELSE 0 END) as available_copies
             FROM books b
             LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
             LEFT JOIN (
               SELECT book_id, COUNT(*) AS cnt FROM favorites GROUP BY book_id
             ) f ON f.book_id = b.id
             LEFT JOIN book_copies bc ON bc.book_id = b.id
             JOIN book_authors ba ON ba.book_id = b.id
             JOIN authors a ON a.id = ba.author_id
             WHERE (MATCH(a.name) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR a.name LIKE CONCAT('%', ?, '%')
             GROUP BY b.id
             ORDER BY ar.avg_rating DESC, b.title ASC
             LIMIT 100`;
      params = [q, q];
    } else if (attr === 'genre') {
      sql = `SELECT DISTINCT b.*, ar.avg_rating, ar.rating_count, COALESCE(f.cnt,0) AS favorites_count,
                    COUNT(bc.id) as total_copies,
                    SUM(CASE WHEN bc.is_available = TRUE THEN 1 ELSE 0 END) as available_copies
             FROM books b
             LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
             LEFT JOIN (
               SELECT book_id, COUNT(*) AS cnt FROM favorites GROUP BY book_id
             ) f ON f.book_id = b.id
             LEFT JOIN book_copies bc ON bc.book_id = b.id
             JOIN book_genres bg ON bg.book_id = b.id
             JOIN genres g ON g.id = bg.genre_id
             WHERE (MATCH(g.name) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR g.name LIKE CONCAT('%', ?, '%')
             GROUP BY b.id
             ORDER BY ar.avg_rating DESC, b.title ASC
             LIMIT 100`;
      params = [q, q];
    } else {
      sql = `SELECT DISTINCT b.*, ar.avg_rating, ar.rating_count, COALESCE(f.cnt, 0) AS favorites_count,
                    COUNT(bc.id) as total_copies,
                    SUM(CASE WHEN bc.is_available = TRUE THEN 1 ELSE 0 END) as available_copies
             FROM books b
             LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
             LEFT JOIN (
               SELECT book_id, COUNT(*) AS cnt FROM favorites GROUP BY book_id
             ) f ON f.book_id = b.id
             LEFT JOIN book_copies bc ON bc.book_id = b.id
             LEFT JOIN book_authors ba ON ba.book_id = b.id
             LEFT JOIN authors a ON a.id = ba.author_id
             LEFT JOIN book_genres bg ON bg.book_id = b.id
             LEFT JOIN genres g ON g.id = bg.genre_id
             WHERE (MATCH(b.title, b.subtitle, b.description) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR (MATCH(a.name) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR (MATCH(g.name) AGAINST (? IN NATURAL LANGUAGE MODE))
                OR b.title LIKE CONCAT('%', ?, '%')
                OR a.name LIKE CONCAT('%', ?, '%')
                OR g.name LIKE CONCAT('%', ?, '%')
             GROUP BY b.id
             ORDER BY ar.avg_rating DESC, b.title ASC
             LIMIT 100`;
      params = [q, q, q, q, q, q];
    }
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (e) {
    console.error('Search error:', e);
    return res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/books/random', async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT b.*, 
              GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as authors,
              ar.avg_rating as average_rating,
              ar.rating_count,
              (SELECT COUNT(*) FROM favorites f WHERE f.book_id = b.id) as favorites_count
       FROM books b
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       GROUP BY b.id
       ORDER BY RAND()
       LIMIT 1`
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No books available' });
    }
    
    return res.json(rows[0]);
  } catch (e) {
    console.error('Get random book error:', e);
    return res.status(500).json({ error: 'Failed to fetch random book' });
  }
});

app.get('/books/top-rated', async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT b.*, 
              GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as authors,
              ar.avg_rating as average_rating,
              ar.rating_count,
              (SELECT COUNT(*) FROM favorites f WHERE f.book_id = b.id) as favorites_count
       FROM books b
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       WHERE ar.avg_rating IS NOT NULL
       GROUP BY b.id
       ORDER BY ar.avg_rating DESC, ar.rating_count DESC
       LIMIT 1`
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No rated books available' });
    }
    
    return res.json(rows[0]);
  } catch (e) {
    console.error('Get top rated book error:', e);
    return res.status(500).json({ error: 'Failed to fetch top rated book' });
  }
});

app.get('/books/most-favorited', async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT b.*, 
              GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') as authors,
              ar.avg_rating as average_rating,
              ar.rating_count,
              (SELECT COUNT(*) FROM favorites f WHERE f.book_id = b.id) as favorites_count
       FROM books b
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       LEFT JOIN favorites f ON f.book_id = b.id
       GROUP BY b.id
       HAVING favorites_count > 0
       ORDER BY favorites_count DESC
       LIMIT 1`
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No favorited books available' });
    }
    
    return res.json(rows[0]);
  } catch (e) {
    console.error('Get most favorited book error:', e);
    return res.status(500).json({ error: 'Failed to fetch most favorited book' });
  }
});

app.get('/books/:id', async (req, res) => {
  const bookId = Number(req.params.id);
  const pool = getPool();
  try {
    const [[book]] = await pool.query(
      `SELECT b.*, ar.avg_rating, ar.rating_count
       FROM books b
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       WHERE b.id = ?`,
      [bookId]
    );
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const [authors] = await pool.query(
      `SELECT a.id, a.name
       FROM book_authors ba JOIN authors a ON a.id = ba.author_id
       WHERE ba.book_id = ? ORDER BY ba.author_order`,
      [bookId]
    );
    const [genres] = await pool.query(
      `SELECT g.id, g.name
       FROM book_genres bg JOIN genres g ON g.id = bg.genre_id
       WHERE bg.book_id = ?`,
      [bookId]
    );
    const [[fav]] = await pool.query(
      `SELECT COUNT(*) AS favorites_count FROM favorites WHERE book_id = ?`,
      [bookId]
    );
    return res.json({ book, authors, genres, favorites_count: fav.favorites_count });
  } catch (e) {
    console.error('Get book details error:', e);
    return res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

app.put('/books/:id', authRequired, librarianRequired, async (req, res) => {
  const bookId = Number(req.params.id);
  const {
    title,
    subtitle,
    description,
    isbn_10,
    isbn_13,
    language_code,
    page_count,
    release_date,
    publisher_id,
    cover_url,
    author_ids = [],
    genre_ids = []
  } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE books SET title = ?, subtitle = ?, description = ?, isbn_10 = ?, isbn_13 = ?, language_code = ?, page_count = ?, release_date = ?, publisher_id = ?, cover_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, subtitle || null, description || null, isbn_10 || null, isbn_13 || null, language_code || null, page_count || null, release_date || null, publisher_id || null, cover_url || null, bookId]
    );
    if (Array.isArray(author_ids)) {
      await conn.query(`DELETE FROM book_authors WHERE book_id = ?`, [bookId]);
      if (author_ids.length > 0) {
        const values = author_ids.map((aid, idx) => [bookId, aid, idx + 1]);
        await conn.query(`INSERT INTO book_authors (book_id, author_id, author_order) VALUES ?`, [values]);
      }
    }
    if (Array.isArray(genre_ids)) {
      await conn.query(`DELETE FROM book_genres WHERE book_id = ?`, [bookId]);
      if (genre_ids.length > 0) {
        const values = genre_ids.map(gid => [bookId, gid]);
        await conn.query(`INSERT INTO book_genres (book_id, genre_id) VALUES ?`, [values]);
      }
    }
    await conn.commit();
    return res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error('Update book error:', e);
    return res.status(500).json({ error: 'Failed to update book' });
  } finally {
    conn.release();
  }
});

app.delete('/books/:id', authRequired, librarianRequired, async (req, res) => {
  const bookId = Number(req.params.id);
  const pool = getPool();
  try {
    const [result] = await pool.query(`DELETE FROM books WHERE id = ?`, [bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('Delete book error:', e);
    return res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.get('/books/:bookId/summary', authRequired, async (req, res) => {
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    const [[book]] = await pool.query(
      `SELECT b.*, ar.avg_rating, ar.rating_count, COALESCE(f.cnt, 0) AS favorites_count
       FROM books b
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       LEFT JOIN (
         SELECT book_id, COUNT(*) AS cnt FROM favorites GROUP BY book_id
       ) f ON f.book_id = b.id
       WHERE b.id = ?`, [bookId]
    );
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const [[myRating]] = await pool.query(
      `SELECT rating, review, created_at, updated_at FROM ratings WHERE user_id = ? AND book_id = ?`,
      [req.user.id, bookId]
    );
    return res.json({ book, my_rating: myRating || null });
  } catch (e) {
    console.error('Get summary error:', e);
    return res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

app.post('/books/:bookId/rating', authRequired, async (req, res) => {
  const bookId = Number(req.params.bookId);
  const { rating, review } = req.body;
  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO ratings (user_id, book_id, rating, review, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), updated_at = NOW()` ,
      [req.user.id, bookId, numRating, review || null]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error('Rate book error:', e);
    return res.status(500).json({ error: 'Failed to rate book' });
  }
});

app.get('/reviews', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort || 'newest';
  const offset = (page - 1) * limit;
  
  const pool = getPool();
  try {
    let orderBy = 'r.created_at DESC';
    switch (sort) {
      case 'newest':
        orderBy = 'r.created_at DESC';
        break;
      case 'oldest':
        orderBy = 'r.created_at ASC';
        break;
      case 'highest_rating':
        orderBy = 'r.rating DESC, r.created_at DESC';
        break;
      case 'lowest_rating':
        orderBy = 'r.rating ASC, r.created_at DESC';
        break;
    }
    
    const [rows] = await pool.query(
      `SELECT r.*, u.username, b.title as book_title, b.cover_url
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       JOIN books b ON b.id = r.book_id
       WHERE r.review IS NOT NULL AND r.review != ''
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM ratings WHERE review IS NOT NULL AND review != ""'
    );
    const total = countResult[0].total;
    
    return res.json({
      reviews: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    console.error('Get reviews error:', e);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.delete('/reviews/:reviewId', authRequired, async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const pool = getPool();
  
  try {
    const [[review]] = await pool.query(
      'SELECT user_id FROM ratings WHERE id = ?',
      [reviewId]
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isLibrarian = req.user.role === 'librarian';
    const isOwner = review.user_id === req.user.id;
    
    if (!isAdmin && !isLibrarian && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await pool.query('DELETE FROM ratings WHERE id = ?', [reviewId]);
    
    return res.json({ ok: true, message: 'Review deleted successfully' });
  } catch (e) {
    console.error('Delete review error:', e);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

app.get('/me/loans', authRequired, async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT l.*, b.title, b.cover_url, bc.barcode, 
              GROUP_CONCAT(a.name SEPARATOR ', ') as author
       FROM loans l
       JOIN book_copies bc ON bc.id = l.copy_id
       JOIN books b ON b.id = bc.book_id
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       WHERE l.user_id = ? AND l.status IN ('active', 'late')
       GROUP BY l.id
       ORDER BY l.due_at ASC`,
      [req.user.id]
    );

    const loansWithFees = rows.map(loan => {
      const currentLateFee = calculateLateFee(loan.due_at, null);
      return {
        ...loan,
        current_late_fee: currentLateFee,
        days_overdue: currentLateFee > 0 ? Math.ceil((new Date() - new Date(loan.due_at)) / (1000 * 60 * 60 * 24)) : 0
      };
    });
    
    return res.json({ loans: loansWithFees });
  } catch (e) {
    console.error('Get user loans error:', e);
    return res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

app.get('/me/loans/history', authRequired, async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT l.*, b.title, b.cover_url, bc.barcode,
              GROUP_CONCAT(a.name SEPARATOR ', ') as author
       FROM loans l
       JOIN book_copies bc ON bc.id = l.copy_id
       JOIN books b ON b.id = bc.book_id
       LEFT JOIN book_authors ba ON ba.book_id = b.id
       LEFT JOIN authors a ON a.id = ba.author_id
       WHERE l.user_id = ? AND l.status = 'returned'
       GROUP BY l.id
       ORDER BY l.returned_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.json({ loans: rows });
  } catch (e) {
    console.error('Get loan history error:', e);
    return res.status(500).json({ error: 'Failed to fetch loan history' });
  }
});

app.post('/me/loans', authRequired, async (req, res) => {
  const { book_id, duration_days = 14 } = req.body;
  const pool = getPool();
  
  try {
    if (!book_id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const [[existingLoan]] = await pool.query(
      `SELECT l.id FROM loans l
       JOIN book_copies bc ON bc.id = l.copy_id
       WHERE l.user_id = ? AND bc.book_id = ? AND l.status IN ('active', 'late')`,
      [req.user.id, book_id]
    );
    
    if (existingLoan) {
      return res.status(400).json({ error: 'You already have this book borrowed' });
    }

    const [[availableCopy]] = await pool.query(
      `SELECT bc.id FROM book_copies bc
       WHERE bc.book_id = ? AND bc.is_available = TRUE
       LIMIT 1`,
      [book_id]
    );
    
    if (!availableCopy) {
      return res.status(400).json({ error: 'No copies available for this book' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + duration_days);

    const [result] = await pool.query(
      'INSERT INTO loans (user_id, copy_id, due_at) VALUES (?, ?, ?)',
      [req.user.id, availableCopy.id, dueDate]
    );

    await pool.query(
      'UPDATE book_copies SET is_available = FALSE WHERE id = ?',
      [availableCopy.id]
    );
    
    return res.json({ 
      ok: true, 
      message: 'Book borrowed successfully',
      loan_id: result.insertId,
      due_date: dueDate
    });
  } catch (e) {
    console.error('Borrow book error:', e);
    return res.status(500).json({ error: 'Failed to borrow book' });
  }
});

app.post('/me/loans/:loanId/return', authRequired, async (req, res) => {
  const loanId = Number(req.params.loanId);
  const pool = getPool();
  
  try {
    const [[loan]] = await pool.query(
      'SELECT * FROM loans WHERE id = ? AND user_id = ? AND status IN ("active", "late")',
      [loanId, req.user.id]
    );
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found or already returned' });
    }

    const lateFee = calculateLateFee(loan.due_at, new Date());

    await pool.query(
      'UPDATE loans SET status = "returned", returned_at = NOW(), late_fee = ? WHERE id = ?',
      [lateFee, loanId]
    );

    await pool.query(
      'UPDATE book_copies SET is_available = TRUE WHERE id = ?',
      [loan.copy_id]
    );

    const message = lateFee > 0 
      ? `Book returned successfully. Late fee: Rp. ${lateFee.toLocaleString('id-ID')}`
      : 'Book returned successfully';
    
    return res.json({ 
      ok: true, 
      message: message,
      late_fee: lateFee 
    });
  } catch (e) {
    console.error('Return book error:', e);
    return res.status(500).json({ error: 'Failed to return book' });
  }
});

app.post('/me/loans/:loanId/extend', authRequired, async (req, res) => {
  const loanId = Number(req.params.loanId);
  const { days } = req.body;
  const pool = getPool();
  
  try {
    if (!days || days < 1 || days > 7) {
      return res.status(400).json({ error: 'Extension must be between 1 and 7 days' });
    }

    const [[loan]] = await pool.query(
      'SELECT * FROM loans WHERE id = ? AND user_id = ? AND status IN ("active", "late")',
      [loanId, req.user.id]
    );
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found or already returned' });
    }

    const now = new Date();
    const dueDate = new Date(loan.due_at);
    if (dueDate < now) {
      return res.status(400).json({ error: 'Cannot extend overdue loans. Please return the book first.' });
    }

    const newDueDate = new Date(loan.due_at);
    newDueDate.setDate(newDueDate.getDate() + Number(days));

    await pool.query(
      'UPDATE loans SET due_at = ?, status = "active" WHERE id = ?',
      [newDueDate, loanId]
    );
    
    return res.json({ 
      ok: true, 
      message: `Due date extended by ${days} day(s)`,
      new_due_date: newDueDate
    });
  } catch (e) {
    console.error('Extend loan error:', e);
    return res.status(500).json({ error: 'Failed to extend loan' });
  }
});

app.post('/books/:bookId/favorite', authRequired, async (req, res) => {
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO favorites (user_id, book_id, created_at) VALUES (?, ?, NOW())`,
      [req.user.id, bookId]
    );
    return res.json({ favorited: true });
  } catch (e) {
    await pool.query(`DELETE FROM favorites WHERE user_id = ? AND book_id = ?`, [req.user.id, bookId]);
    return res.json({ favorited: false });
  }
});

app.get('/me/favorites', authRequired, async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT b.*, ar.avg_rating, ar.rating_count, f.created_at as favorited_at
       FROM favorites f 
       JOIN books b ON b.id = f.book_id
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (e) {
    console.error('Get favorites error:', e);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.get('/me/collections', authRequired, async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(ci.book_id) as book_count
       FROM collections c
       LEFT JOIN collection_items ci ON ci.collection_id = c.id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (e) {
    console.error('Get collections error:', e);
    return res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

app.get('/me/collections/:id/books', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const pool = getPool();
  try {
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const [rows] = await pool.query(
      `SELECT b.*, ar.avg_rating, ar.rating_count, ci.added_at, ci.note
       FROM collection_items ci
       JOIN books b ON b.id = ci.book_id
       LEFT JOIN book_avg_ratings ar ON ar.book_id = b.id
       WHERE ci.collection_id = ?
       ORDER BY ci.added_at DESC`,
      [collectionId]
    );
    return res.json(rows);
  } catch (e) {
    console.error('Get collection books error:', e);
    return res.status(500).json({ error: 'Failed to fetch collection books' });
  }
});

app.post('/me/collections', authRequired, async (req, res) => {
  const { name, description = '', is_public = false } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Collection name is required' });
  }
  
  const pool = getPool();
  try {
    const [result] = await pool.query(
      `INSERT INTO collections (user_id, name, description, is_public, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [req.user.id, name.trim(), description.trim(), !!is_public]
    );
    
    return res.status(201).json({ 
      id: result.insertId, 
      message: 'Collection created successfully' 
    });
  } catch (e) {
    console.error('Create collection error:', e);
    return res.status(500).json({ error: 'Failed to create collection' });
  }
});

app.put('/me/collections/:id', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const { name, description, is_public } = req.body;
  
  const pool = getPool();
  try {
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    const setClause = [];
    const values = [];
    
    if (name !== undefined) {
      setClause.push('name = ?');
      values.push(name.trim());
    }
    if (description !== undefined) {
      setClause.push('description = ?');
      values.push(description.trim());
    }
    if (is_public !== undefined) {
      setClause.push('is_public = ?');
      values.push(!!is_public);
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(collectionId);
    
    await pool.query(
      `UPDATE collections SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );
    
    return res.json({ ok: true, message: 'Collection updated successfully' });
  } catch (e) {
    console.error('Update collection error:', e);
    return res.status(500).json({ error: 'Failed to update collection' });
  }
});

app.delete('/me/collections/:id', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const pool = getPool();
  try {
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    await pool.query('DELETE FROM collections WHERE id = ?', [collectionId]);
    
    return res.json({ ok: true, message: 'Collection deleted successfully' });
  } catch (e) {
    console.error('Delete collection error:', e);
    return res.status(500).json({ error: 'Failed to delete collection' });
  }
});

app.post('/me/collections/:id/books', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const { book_id, note = '' } = req.body;
  
  if (!book_id) {
    return res.status(400).json({ error: 'Book ID is required' });
  }
  
  const pool = getPool();
  try {
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const [[book]] = await pool.query('SELECT id FROM books WHERE id = ?', [book_id]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
  
    const [[existing]] = await pool.query(
      'SELECT collection_id FROM collection_items WHERE collection_id = ? AND book_id = ?',
      [collectionId, book_id]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Book already in collection' });
    }

    await pool.query(
      `INSERT INTO collection_items (collection_id, book_id, added_at, note)
       VALUES (?, ?, NOW(), ?)`,
      [collectionId, book_id, note.trim()]
    );
    
    return res.json({ ok: true, message: 'Book added to collection successfully' });
  } catch (e) {
    console.error('Add book to collection error:', e);
    return res.status(500).json({ error: 'Failed to add book to collection' });
  }
});

app.delete('/me/collections/:id/books/:bookId', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const [result] = await pool.query(
      'DELETE FROM collection_items WHERE collection_id = ? AND book_id = ?',
      [collectionId, bookId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found in collection' });
    }
    
    return res.json({ ok: true, message: 'Book removed from collection successfully' });
  } catch (e) {
    console.error('Remove book from collection error:', e);
    return res.status(500).json({ error: 'Failed to remove book from collection' });
  }
});

// -----------------------------------------------------------------------------
// Collections
// -----------------------------------------------------------------------------
app.post('/collections', authRequired, async (req, res) => {
  const { name = 'My Collection', is_default = false, is_public = false } = req.body;
  const pool = getPool();
  try {
    const [result] = await pool.query(
      `INSERT INTO collections (user_id, name, is_default, is_public, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [req.user.id, name, !!is_default, !!is_public]
    );
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    console.error('Create collection error:', e);
    return res.status(500).json({ error: 'Failed to create collection' });
  }
});

app.post('/collections/:id/items', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const { book_id, note } = req.body;
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO collection_items (collection_id, book_id, added_at, note)
       VALUES (?, ?, NOW(), ?)`,
      [collectionId, book_id, note || null]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error('Add collection item error:', e);
    return res.status(500).json({ error: 'Failed to add item' });
  }
});

app.delete('/collections/:id/items/:bookId', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    await pool.query(
      `DELETE FROM collection_items WHERE collection_id = ? AND book_id = ?`,
      [collectionId, bookId]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error('Remove collection item error:', e);
    return res.status(500).json({ error: 'Failed to remove item' });
  }
});

// -----------------------------------------------------------------------------
// Recommendations
// -----------------------------------------------------------------------------
app.post('/books/:bookId/recommend', authRequired, async (req, res) => {
  const bookId = Number(req.params.bookId);
  const { to_user_id = null, message = null } = req.body;
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO recommendations (book_id, from_user_id, to_user_id, message, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [bookId, req.user.id, to_user_id, message || null]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error('Recommend book error:', e);
    return res.status(500).json({ error: 'Failed to recommend book' });
  }
});

app.get('/me/recommendations', authRequired, async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT r.*, b.title
       FROM recommendations r
       JOIN books b ON b.id = r.book_id
       WHERE r.to_user_id = ? OR r.to_user_id IS NULL
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (e) {
    console.error('Get recommendations error:', e);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// -----------------------------------------------------------------------------
// Borrowing (copies, loans)
// -----------------------------------------------------------------------------
app.get('/books/:bookId/copies', async (req, res) => {
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT c.*, br.name AS branch_name
       FROM book_copies c JOIN branches br ON br.id = c.branch_id
       WHERE c.book_id = ? ORDER BY br.name`,
      [bookId]
    );
    return res.json(rows);
  } catch (e) {
    console.error('Get copies error:', e);
    return res.status(500).json({ error: 'Failed to fetch copies' });
  }
});

app.post('/loans', authRequired, async (req, res) => {
  const { copy_id, days = 14 } = req.body;
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[active]] = await conn.query(
      `SELECT id FROM loans WHERE copy_id = ? AND returned_at IS NULL LIMIT 1`, [copy_id]
    );
    if (active) {
      await conn.rollback();
      return res.status(409).json({ error: 'Copy already loaned' });
    }
    const [result] = await conn.query(
      `INSERT INTO loans (user_id, copy_id, borrowed_at, due_at, status, created_at)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'active', NOW())`,
      [req.user.id, copy_id, days]
    );
    await conn.commit();
    return res.status(201).json({ id: result.insertId });
  } catch (e) {
    await conn.rollback();
    console.error('Create loan error:', e);
    return res.status(500).json({ error: 'Failed to create loan' });
  } finally {
    conn.release();
  }
});

app.post('/loans/:id/return', authRequired, async (req, res) => {
  const loanId = Number(req.params.id);
  const pool = getPool();
  try {
    await pool.query(
      `UPDATE loans SET returned_at = NOW(), status = 'returned' WHERE id = ? AND user_id = ?`,
      [loanId, req.user.id]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error('Return loan error:', e);
    return res.status(500).json({ error: 'Failed to return loan' });
  }
});

app.get('/me/loans', authRequired, async (req, res) => {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT l.*, 
              CASE WHEN l.returned_at IS NULL AND NOW() > l.due_at THEN 'late'
                   WHEN l.returned_at IS NULL THEN 'active'
                   ELSE 'returned' END AS derived_status,
              b.title, c.barcode
       FROM loans l
       JOIN book_copies c ON c.id = l.copy_id
       JOIN books b ON b.id = c.book_id
       WHERE l.user_id = ?
       ORDER BY l.borrowed_at DESC`, [req.user.id]
    );
    return res.json(rows);
  } catch (e) {
    console.error('Get loans error:', e);
    return res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// -----------------------------------------------------------------------------
// Account Settings Routes
// -----------------------------------------------------------------------------
app.get('/me/profile', authRequired, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(rows[0]);
  } catch (e) {
    console.error('Get profile error:', e);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/me/profile', authRequired, async (req, res) => {
  try {
    const { username, email } = req.body;
    const pool = getPool();

    if (username) {
      const [[existing]] = await pool.query(
        'SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1',
        [username, req.user.id]
      );
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    const setClause = [];
    const values = [];
    
    if (username !== undefined) {
      setClause.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      setClause.push('email = ?');
      values.push(email);
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(req.user.id);
    
    const [result] = await pool.query(
      `UPDATE users SET ${setClause.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ ok: true, message: 'Profile updated successfully' });
  } catch (e) {
    console.error('Update profile error:', e);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.put('/me/password', authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );
    
    return res.json({ ok: true, message: 'Password changed successfully' });
  } catch (e) {
    console.error('Change password error:', e);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

app.delete('/me/account', authRequired, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }
    
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ ok: true, message: 'Account deleted successfully' });
  } catch (e) {
    console.error('Delete account error:', e);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

// -----------------------------------------------------------------------------
// Stats endpoint to get real-time database counts
// -----------------------------------------------------------------------------
app.get('/api/stats', async (req, res) => {
  try {
    const pool = getPool();
    const [bookCountResult] = await pool.execute('SELECT COUNT(*) as count FROM books');
    const booksCount = bookCountResult[0].count;
    const [userCountResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const activeUsersCount = userCountResult[0].count;
    
    res.json({
      booksAvailable: booksCount,
      activeMembers: activeUsersCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Listening on ${port}`));
