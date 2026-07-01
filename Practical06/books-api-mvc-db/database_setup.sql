USE bed_db;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE
);
GO

CREATE TABLE UserBooks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (book_id) REFERENCES Books(id)
);
GO

INSERT INTO Users (username, email) VALUES
('alice_wong',  'alice@example.com'),
('bob_tan',     'bob@example.com'),
('charlie_lim', 'charlie@example.com');
GO

INSERT INTO UserBooks (user_id, book_id) VALUES
(1, 1),   -- alice_wong  -> book 1
(1, 2),   -- alice_wong  -> book 2
(2, 1),   -- bob_tan     -> book 1
(3, 3);   -- charlie_lim -> book 3
GO

SELECT * FROM Users;
SELECT * FROM UserBooks;
GO
