--
-- SQL schema for Libly.
--
-- This script creates all of the tables and indexes defined in the
-- database schema.  Run this file against an empty database
-- (recommended name: online_library) to initialise the schema before
-- starting the application.  For convenience you can load it via
-- the MySQL client or phpMyAdmin.  On XAMPP/MariaDB you can copy and
-- paste this entire script into the SQL tab.

-- Drop existing tables if they exist to allow rerunning this script
-- without errors.  Comment out these lines if you want to preserve
-- data during development.
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS search_tokens;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS collection_items;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS holds;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS book_copies;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS book_genres;
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS user_identities;
DROP TABLE IF EXISTS users;

-- Create users table with role and timestamps.  MariaDB supports
-- ENUM types similarly to MySQL.  The password is stored in
-- password_hash column.
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('member','librarian','admin') NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  PRIMARY KEY (id)
);

CREATE TABLE user_identities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_uid VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_provider_uid (provider, provider_uid),
  CONSTRAINT fk_user_identities_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE authors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  born_year INT,
  died_year INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FULLTEXT KEY idx_authors_name (name)
);

CREATE TABLE publishers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_publishers_name (name)
);

CREATE TABLE genres (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  parent_id BIGINT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_genres_name (name),
  FULLTEXT KEY idx_genres_name_ft (name),
  CONSTRAINT fk_genres_parent FOREIGN KEY (parent_id)
    REFERENCES genres (id) ON DELETE SET NULL
);

CREATE TABLE books (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500) NULL,
  description TEXT,
  isbn_10 VARCHAR(10),
  isbn_13 VARCHAR(13) UNIQUE,
  language_code VARCHAR(16),
  page_count INT,
  release_date DATE,
  publisher_id BIGINT UNSIGNED,
  cover_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FULLTEXT KEY idx_books_fulltext (title, subtitle, description),
  CONSTRAINT fk_books_publisher FOREIGN KEY (publisher_id)
    REFERENCES publishers (id) ON DELETE SET NULL
);

CREATE TABLE book_authors (
  book_id BIGINT UNSIGNED NOT NULL,
  author_id BIGINT UNSIGNED NOT NULL,
  author_order INT NOT NULL DEFAULT 1,
  PRIMARY KEY (book_id, author_id),
  INDEX idx_book_authors_author (author_id),
  CONSTRAINT fk_book_authors_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT fk_book_authors_author FOREIGN KEY (author_id)
    REFERENCES authors (id) ON DELETE CASCADE
);

CREATE TABLE book_genres (
  book_id BIGINT UNSIGNED NOT NULL,
  genre_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (book_id, genre_id),
  INDEX idx_book_genres_genre (genre_id),
  CONSTRAINT fk_book_genres_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT fk_book_genres_genre FOREIGN KEY (genre_id)
    REFERENCES genres (id) ON DELETE CASCADE
);

CREATE TABLE branches (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_branches_name (name)
);

CREATE TABLE book_copies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED NOT NULL,
  barcode VARCHAR(64) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_book_copies_barcode (barcode),
  INDEX idx_book_copies_book_branch (book_id, branch_id),
  CONSTRAINT fk_book_copies_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT fk_book_copies_branch FOREIGN KEY (branch_id)
    REFERENCES branches (id) ON DELETE CASCADE
);

CREATE TABLE loans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  copy_id BIGINT UNSIGNED NOT NULL,
  borrowed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at DATETIME NOT NULL,
  returned_at DATETIME,
  status ENUM('active','late','returned','lost') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_loans_user_status (user_id, status),
  INDEX idx_loans_copy_status (copy_id, status),
  INDEX idx_loans_user_borrowed (user_id, borrowed_at),
  CONSTRAINT fk_loans_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_loans_copy FOREIGN KEY (copy_id)
    REFERENCES book_copies (id) ON DELETE CASCADE
);

CREATE TABLE holds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  book_id BIGINT UNSIGNED NOT NULL,
  branch_id BIGINT UNSIGNED,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  queued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ready_by DATETIME,
  fulfilled_loan_id BIGINT UNSIGNED,
  cancelled_at DATETIME,
  PRIMARY KEY (id),
  INDEX idx_holds_book_status (book_id, status),
  INDEX idx_holds_user_status (user_id, status),
  CONSTRAINT fk_holds_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_holds_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT fk_holds_branch FOREIGN KEY (branch_id)
    REFERENCES branches (id) ON DELETE SET NULL,
  CONSTRAINT fk_holds_loan FOREIGN KEY (fulfilled_loan_id)
    REFERENCES loans (id) ON DELETE SET NULL
);

CREATE TABLE ratings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  book_id BIGINT UNSIGNED NOT NULL,
  rating SMALLINT NOT NULL,
  review TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY idx_ratings_unique (user_id, book_id),
  INDEX idx_ratings_book (book_id),
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  user_id BIGINT UNSIGNED NOT NULL,
  book_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id),
  INDEX idx_favorites_book (book_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE collections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'My Collection',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_collections_user_default (user_id, is_default),
  CONSTRAINT fk_collections_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE collection_items (
  collection_id BIGINT UNSIGNED NOT NULL,
  book_id BIGINT UNSIGNED NOT NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  PRIMARY KEY (collection_id, book_id),
  CONSTRAINT fk_collection_items_collection FOREIGN KEY (collection_id)
    REFERENCES collections (id) ON DELETE CASCADE,
  CONSTRAINT fk_collection_items_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE recommendations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id BIGINT UNSIGNED NOT NULL,
  from_user_id BIGINT UNSIGNED NOT NULL,
  to_user_id BIGINT UNSIGNED NULL,
  message TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_recommendations_to (to_user_id),
  INDEX idx_recommendations_from (from_user_id),
  INDEX idx_recommendations_book (book_id),
  CONSTRAINT fk_recommendations_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_from FOREIGN KEY (from_user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_to FOREIGN KEY (to_user_id)
    REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE search_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(100) NOT NULL,
  weight DECIMAL(6,2) NOT NULL DEFAULT 1.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_search_tokens_token (token),
  INDEX idx_search_tokens_book (book_id),
  FULLTEXT KEY idx_search_tokens_token_ft (token),
  CONSTRAINT fk_search_tokens_book FOREIGN KEY (book_id)
    REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT UNSIGNED,
  metadata JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE SET NULL
);

-- Book average rating view.  This view computes the average rating and
-- count for each book.  It is used by the /books/search and
-- /books/:id/summary endpoints.
CREATE OR REPLACE VIEW book_avg_ratings AS
SELECT b.id AS book_id,
       COALESCE(AVG(r.rating), 0) AS avg_rating,
       COUNT(r.id) AS rating_count
FROM books b
LEFT JOIN ratings r ON r.book_id = b.id
GROUP BY b.id;