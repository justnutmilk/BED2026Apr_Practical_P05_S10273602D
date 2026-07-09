const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// POST /register
// Registers a new user (member or librarian) with a hashed password.
async function register(req, res) {
  const { username, password, role } = req.body;

  try {
    // 1. Check if the username is already taken.
    //    (Done BEFORE hashing - no point spending effort hashing a
    //    password for a registration we're going to reject.)
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 2. Hash the password (bcrypt: generate a salt, then hash with it).
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Store the user with the ALREADY-HASHED password.
    const newUser = await userModel.createUser({ username, passwordHash, role });

    // 4. Success.
    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /login
// Verifies credentials and, on success, returns a signed JWT.
async function login(req, res) {
  const { username, password } = req.body;

  try {
    // 1. Look up the user by username.
    const user = await userModel.getUserByUsername(username);
    if (!user) {
      // Deliberately the SAME message as a wrong password, so we don't
      // reveal whether the username exists (prevents username enumeration).
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Compare the typed password against the stored hash.
    //    bcrypt.compare re-hashes using the salt baked into the stored
    //    hash, so it matches even though every hash looks different.
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Build the token payload: ONLY what's needed for authorization.
    //    Never put the password/hash here - a JWT is signed, not encrypted,
    //    so anyone can decode and read the payload.
    const payload = {
      user_id: user.user_id,
      role: user.role,
    };

    // 4. Sign the token with our secret (from .env) and set an expiry.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3600s", // 1 hour
    });

    // 5. Return the token to the client.
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
};
