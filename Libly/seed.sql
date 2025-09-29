--
-- Sample data for the OnlineLibrary application
--
-- This script populates authors, genres, publishers, books, book
-- relationships, branches and copies.  Use this to test the basic
-- functionality of the API.  Run after schema.sql has been
-- applied.

INSERT INTO authors (name, created_at) VALUES
('J. K. Rowling', NOW()),
('George Orwell', NOW()),
('Jane Austen', NOW()),
('Suzanne Collins', NOW());

INSERT INTO genres (name, created_at) VALUES
('Fantasy', NOW()),
('Dystopian', NOW()),
('Romance', NOW()),
('Science Fiction', NOW());

INSERT INTO publishers (name, created_at) VALUES
('Penguin', NOW()),
('HarperCollins', NOW()),
('Scholastic', NOW());

-- Books: title, subtitle, description, language_code, page_count, release_date, publisher_id
INSERT INTO books (title, subtitle, description, language_code, page_count, release_date, publisher_id, created_at, updated_at) VALUES
('1984', NULL, 'A chilling dystopian novel about a totalitarian regime.', 'en', 328, '1949-06-08', 1, NOW(), NOW()),
('Pride and Prejudice', NULL, 'A classic romance novel.', 'en', 279, '1813-01-28', 2, NOW(), NOW()),
('Harry Potter and the Sorcerer''s Stone', NULL, 'The first book in the Harry Potter series.', 'en', 309, '1997-06-26', 2, NOW(), NOW()),
('The Hunger Games', NULL, 'A dystopian novel where teens must fight to the death.', 'en', 374, '2008-09-14', 3, NOW(), NOW());

-- Link books to authors (book_id, author_id, author_order)
INSERT INTO book_authors (book_id, author_id, author_order) VALUES
(1, 2, 1), -- 1984 by George Orwell
(2, 3, 1), -- Pride and Prejudice by Jane Austen
(3, 1, 1), -- HP by J.K. Rowling
(4, 4, 1); -- Hunger Games by Suzanne Collins

-- Link books to genres (book_id, genre_id)
INSERT INTO book_genres (book_id, genre_id) VALUES
(1, 2), -- 1984 is Dystopian
(2, 3), -- Pride and Prejudice is Romance
(3, 1), -- HP is Fantasy
(4, 2), (4, 4); -- Hunger Games is Dystopian and Sci-Fi

-- Create branches
INSERT INTO branches (name, created_at) VALUES
('Main Branch', NOW()),
('West Branch', NOW());

-- Create copies: book_id, branch_id, barcode, is_available, created_at
INSERT INTO book_copies (book_id, branch_id, barcode, is_available, created_at) VALUES
(1, 1, '1984-MAIN-001', 1, NOW()),
(1, 2, '1984-WEST-001', 1, NOW()),
(2, 1, 'PAP-MAIN-001', 1, NOW()),
(3, 1, 'HP-MAIN-001', 1, NOW()),
(3, 2, 'HP-WEST-001', 1, NOW()),
(4, 1, 'HG-MAIN-001', 1, NOW());