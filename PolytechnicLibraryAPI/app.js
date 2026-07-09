const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
// Load environment variables (DB credentials + JWT secret) from .env
dotenv.config();

const authController = require("./controllers/authController");
const bookController = require("./controllers/bookController");
const { verifyJWT } = require("./middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
} = require("./middlewares/validation");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- OPEN routes (no token required) ---
// These MUST stay open: they are how a user gets a token in the first place.
// Requiring a token to register or log in would be a chicken-and-egg deadlock.
app.post("/register", validateRegistration, authController.register);
app.post("/login", validateLogin, authController.login);

// --- PROTECTED routes (verifyJWT checks the token AND the role) ---
// verifyJWT's internal role map decides who may reach each one:
//   GET /books                     -> member OR librarian
//   PUT /books/:bookId/availability -> librarian only
app.get("/books", verifyJWT, bookController.getAllBooks);
app.put(
  "/books/:bookId/availability",
  verifyJWT,
  bookController.updateBookAvailability
);

// Start the server
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
