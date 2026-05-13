const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/students", async (req, res) => {
  const newStudentData = req.body; //Retrieve JSON from body
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request(); // Create a request object
    request.input("name", newStudentData.name);       // Bind name from req.body
    request.input("address", newStudentData.address);  // Bind address from req.body
    const result = await request.query(
      "INSERT INTO Students (name, address) VALUES (@name, @address); SELECT SCOPE_IDENTITY() AS student_id;"
    );

    const newStudentId = result.recordset[0].student_id;
    const getNewStudentRequest = connection.request();
    getNewStudentRequest.input("student_id", newStudentId);
    const newStudentResult = await getNewStudentRequest.query(
      "SELECT * FROM Students WHERE student_id = @student_id"
    );

    res.status(201).json(newStudentResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request(); // Create a request object
    const result = await request.query(
      "Select * from Students"
    );

    res.status(200).json(result.recordset); // Send the result as JSON
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error fetching students");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

app.get("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @student_id`;
    const request = connection.request();
    request.input("student_id", studentId);
    const result = await request.query(sqlQuery);

    if (!result.recordset[0]) {
      return res.status(404).send("Student not found");
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /students/${studentId}:`, error);
    res.status(500).send("Error fetching student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const updatedStudentData = req.body;

  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const sqlQuery = `UPDATE Students SET name = @name, address = @address WHERE student_id = @student_id`;
    const request = connection.request();
    request.input("student_id", studentId);
    request.input("name", updatedStudentData.name);
    request.input("address", updatedStudentData.address);
    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }

    // Fetch the updated student
    const getUpdatedStudentQuery = `SELECT student_id, name, address FROM Students WHERE student_id = @student_id`;
    const getUpdatedStudentRequest = connection.request();
    getUpdatedStudentRequest.input("student_id", studentId);
    const updatedStudentResult = await getUpdatedStudentRequest.query(getUpdatedStudentQuery);

    res.json(updatedStudentResult.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /students/${studentId}:`, error);
    res.status(500).send("Error updating student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

app.delete("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);

  if (isNaN(studentId)) {
    return res.status(400).send("Invalid student ID");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig); // Get the database connection
    const sqlQuery = `DELETE FROM Students WHERE student_id = @student_id`;
    const request = connection.request();
    // Bind parameters from the request body
    request.input("student_id", studentId);
    const result = await request.query(sqlQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Student not found");
    }

    res.status(204).send(); // Send 204 No Content status on successful deletion
  } catch (error) {
    console.error(`Error in DELETE /students/${studentId}:`, error);
    res.status(500).send("Error deleting student");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
});

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});