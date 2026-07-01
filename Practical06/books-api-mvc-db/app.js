const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");
// Load environment variables
dotenv.config();

const bookController = require("./controllers/bookController");
const {
  validateBook,
  validateBookId,
} = require("./middlewares/bookValidation"); // import Book Validation Middleware

const userController = require("./controllers/userController");
const {
  validateUser,
  validateUserId,
} = require("./middlewares/userValidation"); // import User Validation Middleware

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware (Parsing request bodies)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Serve static files from the 'public' directory ---
app.use(express.static(path.join(__dirname, "public")));

// Routes for books
// Apply middleware *before* the controller function for routes that need it
app.get("/books", bookController.getAllBooks);
app.get("/books/:id", validateBookId, bookController.getBookById);
app.post("/books", validateBook, bookController.createBook);
app.put("/books/:id", validateBookId, validateBook, bookController.updateBook);
app.delete("/books/:id", validateBookId, bookController.deleteBook);

// Routes for users
// IMPORTANT: specific paths (/search, /with-books) must come BEFORE /users/:id,
// otherwise the wildcard :id would capture "search" and "with-books" as an id.
app.get("/users/search", userController.searchUsers);
app.get("/users/with-books", userController.getUsersWithBooks);
app.get("/users", userController.getAllUsers);
app.get("/users/:id", validateUserId, userController.getUserById);
app.post("/users", validateUser, userController.createUser);
app.put("/users/:id", validateUserId, validateUser, userController.updateUser);
app.delete("/users/:id", validateUserId, userController.deleteUser);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
