const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get all users
async function getAllUsers() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, username, email FROM Users";
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

// Get user by ID
async function getUserById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = "SELECT id, username, email FROM Users WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // User not found
    }

    return result.recordset[0];
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

// Create new user
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO Users (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY() AS id;";
    const request = connection.request();
    request.input("username", userData.username);
    request.input("email", userData.email);
    const result = await request.query(query);

    const newUserId = result.recordset[0].id;
    return await getUserById(newUserId);
  } catch (error) {
    console.error("Database error:", error);
    // SQL Server 2627/2601 = UNIQUE constraint violation (duplicate username/email)
    if (error.number === 2627 || error.number === 2601) {
      const duplicateError = new Error("Username or email already exists");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
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

// Update user by ID
async function updateUser(id, userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "UPDATE Users SET username = @username, email = @email WHERE id = @id";
    const request = connection.request();
    request.input("id", id);
    request.input("username", userData.username);
    request.input("email", userData.email);
    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return null; // User not found
    }

    return await getUserById(id);
  } catch (error) {
    console.error("Database error:", error);
    // SQL Server 2627/2601 = UNIQUE constraint violation (duplicate username/email)
    if (error.number === 2627 || error.number === 2601) {
      const duplicateError = new Error("Username or email already exists");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
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

// Delete user by ID
async function deleteUser(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    // Remove the user's links in the join table first so the
    // foreign key constraint does not block the delete.
    const query =
      "DELETE FROM UserBooks WHERE user_id = @id; DELETE FROM Users WHERE id = @id;";
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(query);

    return result.rowsAffected[result.rowsAffected.length - 1] > 0; // true if a user row was deleted
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

// Search users by username or email (partial match)
async function searchUsers(searchTerm) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "SELECT id, username, email FROM Users WHERE username LIKE @searchTerm OR email LIKE @searchTerm";
    const request = connection.request();
    // Wildcards go on the VALUE, still passed via .input() (safe from SQL injection)
    request.input("searchTerm", `%${searchTerm}%`);
    const result = await request.query(query);
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

// Get all users together with the books linked to them (via JOINs)
async function getUsersWithBooks() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    // LEFT JOIN so that users with no books still appear (with an empty book list)
    const query = `
      SELECT
        u.id AS user_id,
        u.username,
        u.email,
        b.id AS book_id,
        b.title,
        b.author
      FROM Users u
      LEFT JOIN UserBooks ub ON u.id = ub.user_id
      LEFT JOIN Books b ON ub.book_id = b.id
      ORDER BY u.id;
    `;
    const result = await connection.request().query(query);

    // The JOIN returns FLAT rows (one row per user-book pair).
    // Reshape them into nested objects: each user with a books array.
    const usersMap = {};
    for (const row of result.recordset) {
      if (!usersMap[row.user_id]) {
        usersMap[row.user_id] = {
          id: row.user_id,
          username: row.username,
          email: row.email,
          books: [],
        };
      }
      // book_id is null for a user with no linked books (LEFT JOIN)
      if (row.book_id) {
        usersMap[row.user_id].books.push({
          id: row.book_id,
          title: row.title,
          author: row.author,
        });
      }
    }

    return Object.values(usersMap);
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
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersWithBooks,
};
