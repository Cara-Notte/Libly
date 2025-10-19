const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { getPool } = require('./db');

// Load environment variables from .env if present.  This is also
// performed in db.js, but loading here ensures that JWT_SECRET and
// other server-specific settings are available.
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configuration values
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
    // ensure role is present; default to 'member' if missing
    role: user.role || 'member'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/**
 * Middleware to enforce authentication.  Looks for a JWT in the
 * Authorization header (as a Bearer token) or in the cookie named
 * `token`.  If valid, attaches the decoded payload to req.user.
 * Otherwise responds with 401.
 */
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

/**
 * Middleware to enforce admin role.  Must be used after authRequired.
 * If the authenticated user does not have the 'admin' role, respond
 * with 403 Forbidden.  The authenticated user's role is decoded
 * from the JWT and attached to req.user by authRequired.
 */
function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * Middleware to enforce librarian or admin role.  Must be used after authRequired.
 * If the authenticated user does not have the 'librarian' or 'admin' role, respond
 * with 403 Forbidden.  The authenticated user's role is decoded
 * from the JWT and attached to req.user by authRequired.
 */
function librarianRequired(req, res, next) {
  if (!req.user || (req.user.role !== 'librarian' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
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

// List all users (public info).  Does not include password hashes.
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

// Register a new user.  Expects { username, password, email (optional) }
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

// Update a user.  Only admin users may update other users.  Allows
// updating username, email, role and is_active.  Does not allow
// changing password.
app.put('/users/:id', authRequired, adminRequired, async (req, res) => {
  const userId = Number(req.params.id);
  const { username, email, role, is_active } = req.body;
  const pool = getPool();
  try {
    // Validate role if provided
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

// Delete a user.  Only admin users may delete other users.  Do not
// allow an admin to delete themselves to prevent lockout.
app.delete('/users/:id', authRequired, adminRequired, async (req, res) => {
  const userId = Number(req.params.id);
  // Prevent self-deletion
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

// User login.  Expects { username, password }.  Returns a JWT in
// response body.  Optionally sets a httpOnly cookie if
// USE_COOKIE_AUTH is true in environment (disabled by default).
app.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const pool = getPool();
    // select id, username, password_hash and role so that the token includes the role
    const [rows] = await pool.query('SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    // sign token with id, username and role
    const token = signToken({ id: user.id, username: user.username, role: user.role });
    // Optionally set token in cookie for browser clients
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

// Create a new book.  Requires authentication.  Only role 'librarian'
// or 'admin' should be allowed.
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

// Search books.  Supports full text search on title, subtitle, description,
// author name and genre name.  If no query is provided, returns
// latest 50 books ordered by created date.
// Get all books with pagination and sorting
app.get('/books', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const sort = req.query.sort || 'title_asc';
  const offset = (page - 1) * limit;
  
  const pool = getPool();
  try {
    // Build ORDER BY clause based on sort parameter
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
    
    // Get total count for pagination
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
    // Optional attribute filter: if provided, restrict search to a specific field
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
      // default search across title, author and genre
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

// Get random book for "Today's Pick"
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

// Get top rated book
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

// Get most favorited book
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

// Retrieve full book details including authors, genres, average rating,
// rating count and favorites count.  Public route, no auth required.
app.get('/books/:id', async (req, res) => {
  const bookId = Number(req.params.id);
  const pool = getPool();
  try {
    // fetch book basic info and average rating
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
    // fetch authors
    const [authors] = await pool.query(
      `SELECT a.id, a.name
       FROM book_authors ba JOIN authors a ON a.id = ba.author_id
       WHERE ba.book_id = ? ORDER BY ba.author_order`,
      [bookId]
    );
    // fetch genres
    const [genres] = await pool.query(
      `SELECT g.id, g.name
       FROM book_genres bg JOIN genres g ON g.id = bg.genre_id
       WHERE bg.book_id = ?`,
      [bookId]
    );
    // favorites count
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

// Update a book.  Only admin users may update.  Accepts same fields as
// create: title, subtitle, description, isbn_10, isbn_13, language_code,
// page_count, release_date, publisher_id, cover_url, author_ids, genre_ids.
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
    // update book base attributes; skip unknown fields
    await conn.query(
      `UPDATE books SET title = ?, subtitle = ?, description = ?, isbn_10 = ?, isbn_13 = ?, language_code = ?, page_count = ?, release_date = ?, publisher_id = ?, cover_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, subtitle || null, description || null, isbn_10 || null, isbn_13 || null, language_code || null, page_count || null, release_date || null, publisher_id || null, cover_url || null, bookId]
    );
    // update authors associations if provided
    if (Array.isArray(author_ids)) {
      await conn.query(`DELETE FROM book_authors WHERE book_id = ?`, [bookId]);
      if (author_ids.length > 0) {
        const values = author_ids.map((aid, idx) => [bookId, aid, idx + 1]);
        await conn.query(`INSERT INTO book_authors (book_id, author_id, author_order) VALUES ?`, [values]);
      }
    }
    // update genres associations if provided
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

// Delete a book.  Only admin users may delete.  Cascading deletes
// will remove related authors/genres associations and copies due to
// foreign key constraints in the schema.
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

// Get book summary along with average rating and the logged-in user's own rating (if logged in)
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

// Rate a book (1..5 stars).  If the user has already rated the book,
// update the rating and review.
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

// Get all reviews with pagination and sorting
app.get('/reviews', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const sort = req.query.sort || 'newest';
  const offset = (page - 1) * limit;
  
  const pool = getPool();
  try {
    // Build ORDER BY clause based on sort parameter
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
    
    // Get total count for pagination
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

// Delete a review (admin or review owner)
app.delete('/reviews/:reviewId', authRequired, async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const pool = getPool();
  
  try {
    // Check if review exists and get user info
    const [[review]] = await pool.query(
      'SELECT user_id FROM ratings WHERE id = ?',
      [reviewId]
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Check if user is admin, librarian, or review owner
    const isAdmin = req.user.role === 'admin';
    const isLibrarian = req.user.role === 'librarian';
    const isOwner = review.user_id === req.user.id;
    
    if (!isAdmin && !isLibrarian && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }
    
    // Delete the review
    await pool.query('DELETE FROM ratings WHERE id = ?', [reviewId]);
    
    return res.json({ ok: true, message: 'Review deleted successfully' });
  } catch (e) {
    console.error('Delete review error:', e);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get user's active loans
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
    
    return res.json({ loans: rows });
  } catch (e) {
    console.error('Get user loans error:', e);
    return res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Get user's loan history
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

// Borrow a book
app.post('/me/loans', authRequired, async (req, res) => {
  const { book_id, duration_days = 14 } = req.body;
  const pool = getPool();
  
  try {
    if (!book_id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    
    // Check if user already has this book borrowed
    const [[existingLoan]] = await pool.query(
      `SELECT l.id FROM loans l
       JOIN book_copies bc ON bc.id = l.copy_id
       WHERE l.user_id = ? AND bc.book_id = ? AND l.status IN ('active', 'late')`,
      [req.user.id, book_id]
    );
    
    if (existingLoan) {
      return res.status(400).json({ error: 'You already have this book borrowed' });
    }
    
    // Find available copy
    const [[availableCopy]] = await pool.query(
      `SELECT bc.id FROM book_copies bc
       WHERE bc.book_id = ? AND bc.is_available = TRUE
       LIMIT 1`,
      [book_id]
    );
    
    if (!availableCopy) {
      return res.status(400).json({ error: 'No copies available for this book' });
    }
    
    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + duration_days);
    
    // Create loan
    const [result] = await pool.query(
      'INSERT INTO loans (user_id, copy_id, due_at) VALUES (?, ?, ?)',
      [req.user.id, availableCopy.id, dueDate]
    );
    
    // Mark copy as unavailable
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

// Return a book
app.post('/me/loans/:loanId/return', authRequired, async (req, res) => {
  const loanId = Number(req.params.loanId);
  const pool = getPool();
  
  try {
    // Get loan details
    const [[loan]] = await pool.query(
      'SELECT * FROM loans WHERE id = ? AND user_id = ? AND status IN ("active", "late")',
      [loanId, req.user.id]
    );
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found or already returned' });
    }
    
    // Update loan status
    await pool.query(
      'UPDATE loans SET status = "returned", returned_at = NOW() WHERE id = ?',
      [loanId]
    );
    
    // Mark copy as available
    await pool.query(
      'UPDATE book_copies SET is_available = TRUE WHERE id = ?',
      [loan.copy_id]
    );
    
    return res.json({ ok: true, message: 'Book returned successfully' });
  } catch (e) {
    console.error('Return book error:', e);
    return res.status(500).json({ error: 'Failed to return book' });
  }
});

// Toggle favorite for a book.  If a favorite does not exist, create it.
// If it exists, remove it.
app.post('/books/:bookId/favorite', authRequired, async (req, res) => {
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    // Try to insert; if duplicate, delete instead
    await pool.query(
      `INSERT INTO favorites (user_id, book_id, created_at) VALUES (?, ?, NOW())`,
      [req.user.id, bookId]
    );
    return res.json({ favorited: true });
  } catch (e) {
    // Duplicate or other error.  Try delete
    await pool.query(`DELETE FROM favorites WHERE user_id = ? AND book_id = ?`, [req.user.id, bookId]);
    return res.json({ favorited: false });
  }
});

// Get the current user's favorite books with additional info
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

// Get user's collections
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

// Get books in a specific collection
app.get('/me/collections/:id/books', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const pool = getPool();
  try {
    // Verify collection belongs to user
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

// Create a new collection
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

// Update a collection
app.put('/me/collections/:id', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const { name, description, is_public } = req.body;
  
  const pool = getPool();
  try {
    // Verify collection belongs to user
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

// Delete a collection
app.delete('/me/collections/:id', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const pool = getPool();
  try {
    // Verify collection belongs to user
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Delete collection (cascading delete will remove collection_items)
    await pool.query('DELETE FROM collections WHERE id = ?', [collectionId]);
    
    return res.json({ ok: true, message: 'Collection deleted successfully' });
  } catch (e) {
    console.error('Delete collection error:', e);
    return res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Add book to collection
app.post('/me/collections/:id/books', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const { book_id, note = '' } = req.body;
  
  if (!book_id) {
    return res.status(400).json({ error: 'Book ID is required' });
  }
  
  const pool = getPool();
  try {
    // Verify collection belongs to user
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Check if book exists
    const [[book]] = await pool.query('SELECT id FROM books WHERE id = ?', [book_id]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Check if book already in collection
    const [[existing]] = await pool.query(
      'SELECT collection_id FROM collection_items WHERE collection_id = ? AND book_id = ?',
      [collectionId, book_id]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Book already in collection' });
    }
    
    // Add book to collection
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

// Remove book from collection
app.delete('/me/collections/:id/books/:bookId', authRequired, async (req, res) => {
  const collectionId = Number(req.params.id);
  const bookId = Number(req.params.bookId);
  const pool = getPool();
  try {
    // Verify collection belongs to user
    const [[collection]] = await pool.query(
      'SELECT id FROM collections WHERE id = ? AND user_id = ?',
      [collectionId, req.user.id]
    );
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Remove book from collection
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

// Create a collection
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

// Add a book to a collection
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

// Remove a book from a collection
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

// Recommend a book to another user or publicly.  'to_user_id' may be
// null to indicate a public recommendation.
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

// Get recommendations for the current user (direct or public)
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

// List copies for a book (public)
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

// Create a loan.  Expects { copy_id, days }.  Picks the specified
// copy.  If the copy is already on an active loan, returns 409.
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

// Return a loan
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

// Get the current user's loans, with a derived status of late/active/returned
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

// Get current user profile
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

// Update current user profile (username, email)
app.put('/me/profile', authRequired, async (req, res) => {
  try {
    const { username, email } = req.body;
    const pool = getPool();
    
    // Check if username already exists (excluding current user)
    if (username) {
      const [[existing]] = await pool.query(
        'SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1',
        [username, req.user.id]
      );
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }
    
    // Update user profile
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

// Change password
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
    
    // Get current password hash
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
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

// Delete current user account
app.delete('/me/account', authRequired, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }
    
    const pool = getPool();
    
    // Get current password hash
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }
    
    // Delete user account (cascading deletes will handle related data)
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
    
    // Get total number of books
    const [bookCountResult] = await pool.execute('SELECT COUNT(*) as count FROM books');
    const booksCount = bookCountResult[0].count;
    
    // Get total number of active users
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

// -----------------------------------------------------------------------------
// Root route to serve the index page
// -----------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`Listening on ${port}`));
