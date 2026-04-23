const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Homework API!");
});

app.get("/intro", (req, res) => {
  res.send("Hi I'm Jasper and I'm server.");
});

app.get("/name", (req, res) => {
  res.send("Jasper");
});

app.get("/hobbies", (req, res) => {
  res.send("Hobbies:<br>1. Coding<br>2. Watching movies<br>3. Reading");
});

app.get("/food", (req, res) => {
  res.send("Favourite Food:\n1. Laksa\n2. Chicken Rice\n3. Ginger");
});

app.get("/list", (req, res) => {
  res.json(["coding", "reading", "cycling"]);
});

app.get("/object", (req, res) => {
  res.json({
  "name": "Alex",
  "hobbies": ["coding", "reading", "cycling"],
  "intro": "Hi, I'm Alex, a Year 2 student passionate about building APIs!"
});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});