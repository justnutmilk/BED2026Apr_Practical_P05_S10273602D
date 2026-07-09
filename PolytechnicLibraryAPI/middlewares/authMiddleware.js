const jwt = require("jsonwebtoken");

// Which roles may access which endpoint.
// Key   = "METHOD path-pattern"  (the path part is a regular-expression fragment)
// Value = the list of roles allowed to call it.
const authorizedRoles = {
  "GET /books": ["member", "librarian"], // anyone logged in can view books
  "PUT /books/[0-9]+/availability": ["librarian"], // only librarians can update
};

// Authorization middleware: verify the JWT, then check the user's role
// is allowed to reach the requested endpoint. Runs BEFORE the controller.
function verifyJWT(req, res, next) {
  // 1. Pull the token out of the "Authorization: Bearer <token>" header.
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. No token at all -> 401 (we can't tell who you are).
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: no token provided" });
  }

  // 3. Verify the token's signature and expiry using our secret.
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // 4. Bad or expired token -> 401 (your credential failed verification).
    if (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized: invalid or expired token" });
    }

    // 5. Find the rule that matches this request (method + path).
    const requestedEndpoint = `${req.method} ${req.path}`;
    const matchedRule = Object.entries(authorizedRoles).find(([endpoint]) =>
      new RegExp(`^${endpoint}$`).test(requestedEndpoint)
    );

    // 6. No matching rule, or the user's role isn't in the allowed list
    //    -> 403 (we know who you are, but you're not permitted here).
    if (!matchedRule || !matchedRule[1].includes(decoded.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you do not have access to this resource" });
    }

    // 7. Authenticated AND authorized: attach the user info and continue.
    req.user = decoded;
    next();
  });
}

module.exports = {
  verifyJWT,
};
