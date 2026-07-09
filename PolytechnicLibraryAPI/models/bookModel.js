const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all books (including their availability).
async function getAllBooks() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT book_id, title, author, availability FROM Books";
    const result = await connection.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Update ONLY the availability ('Y'/'N') of a book by its id.
// Returns the updated book on success, or null if no book has that id
// (the controller turns that null into a 404 response).
async function updateBookAvailability(bookId, availability) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "UPDATE Books SET availability = @availability WHERE book_id = @bookId";
    const request = connection.request();
    request.input("bookId", bookId);
    request.input("availability", availability);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null; // No book with that id
    }

    // Re-fetch the updated book so the controller can return it
    const selectRequest = connection.request();
    selectRequest.input("bookId", bookId);
    const updated = await selectRequest.query(
      "SELECT book_id, title, author, availability FROM Books WHERE book_id = @bookId"
    );
    return updated.recordset[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

module.exports = {
  getAllBooks,
  updateBookAvailability,
};
