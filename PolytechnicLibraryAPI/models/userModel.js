const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get a single user by their username.
// Returns the FULL record including passwordHash, because login needs
// the hash to compare against. (The controller is responsible for never
// sending passwordHash back to the client.)
async function getUserByUsername(username) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "SELECT user_id, username, passwordHash, role FROM Users WHERE username = @username";
    const request = connection.request();
    request.input("username", username); // parameterized -> safe from SQL injection
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null; // No user with that username
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

// Create a new user.
// Expects an ALREADY-HASHED passwordHash (the controller does the hashing;
// the model only writes to the database, never does crypto).
async function createUser(userData) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query =
      "INSERT INTO Users (username, passwordHash, role) VALUES (@username, @passwordHash, @role); SELECT SCOPE_IDENTITY() AS user_id;";
    const request = connection.request();
    request.input("username", userData.username);
    request.input("passwordHash", userData.passwordHash);
    request.input("role", userData.role);
    const result = await request.query(query);

    const newUserId = result.recordset[0].user_id;
    // Return the new user WITHOUT the passwordHash
    return { user_id: newUserId, username: userData.username, role: userData.role };
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
  getUserByUsername,
  createUser,
};
