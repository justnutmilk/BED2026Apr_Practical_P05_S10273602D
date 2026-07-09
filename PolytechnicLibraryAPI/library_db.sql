-- ============================================================
-- Polytechnic Library API - Database Schema
-- Run this in SQL Server Management Studio (SSMS).
-- Safely re-runnable: the database, tables, and sample books
-- are each created only if they do not already exist, so
-- re-running never errors and never wipes existing data.
-- (Users are created via POST /register, not seeded here.)
-- ============================================================

-- Create the database once (skips if it already exists)
IF DB_ID('library_db') IS NULL
    CREATE DATABASE library_db;
GO

USE library_db;
GO

-- ------------------------------------------------------------
-- Users table (created only if it doesn't already exist)
--   Note: SQL Server has NO "CREATE TABLE IF NOT EXISTS"
--   (that is SQLite). We guard with OBJECT_ID instead.
--   user_id      : auto-incrementing primary key
--   username     : required, must be unique
--   passwordHash : the bcrypt hash of the password (never the raw password)
--   role         : must be 'member' or 'librarian' (enforced by CHECK)
-- ------------------------------------------------------------
IF OBJECT_ID('Users', 'U') IS NULL
BEGIN
    CREATE TABLE Users (
        user_id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'librarian'))
    );
END
GO

-- ------------------------------------------------------------
-- Books table (created only if it doesn't already exist)
--   book_id      : auto-incrementing primary key
--   title/author : required
--   availability : must be 'Y' or 'N' (enforced by CHECK); defaults to 'Y'
-- ------------------------------------------------------------
IF OBJECT_ID('Books', 'U') IS NULL
BEGIN
    CREATE TABLE Books (
        book_id INT IDENTITY(1,1) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        availability CHAR(1) NOT NULL DEFAULT 'Y' CHECK (availability IN ('Y', 'N'))
    );
END
GO

-- ------------------------------------------------------------
-- Seed sample books ONLY if the table is empty.
-- IF NOT EXISTS (SELECT 1 FROM Books) is true when there are
-- no rows yet, so re-running the script won't duplicate books.
-- ------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Books)
BEGIN
    INSERT INTO Books (title, author, availability) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Y'),
    ('1984', 'George Orwell', 'N'),
    ('To Kill a Mockingbird', 'Harper Lee', 'Y'),
    ('Clean Code', 'Robert C. Martin', 'Y');
END
GO

-- Quick check
SELECT * FROM Books;
GO
