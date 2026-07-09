const bookModel = require("../models/bookModel");

// GET /books
// Returns all books (accessible to any authenticated user - member or librarian).
async function getAllBooks(req, res) {
  try {
    const books = await bookModel.getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ message: "Error retrieving books" });
  }
}

// PUT /books/:bookId/availability
// Updates a book's availability ('Y'/'N'). Restricted to librarians (via verifyJWT).
async function updateBookAvailability(req, res) {
  try {
    const bookId = parseInt(req.params.bookId);
    const { availability } = req.body;

    // Validate the availability value before hitting the database.
    // (The DB CHECK constraint is the backstop; this gives a clean 400.)
    if (availability !== "Y" && availability !== "N") {
      return res
        .status(400)
        .json({ message: "Availability must be 'Y' or 'N'" });
    }

    const updatedBook = await bookModel.updateBookAvailability(bookId, availability);

    // Model returns null when no book has that id -> 404.
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ message: "Error updating book availability" });
  }
}

module.exports = {
  getAllBooks,
  updateBookAvailability,
};
