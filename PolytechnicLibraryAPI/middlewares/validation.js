const Joi = require("joi");

// Schema for POST /register
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(255).required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username cannot exceed 255 characters",
    "any.required": "Username is required",
  }),
  password: Joi.string().min(8).max(255).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password cannot exceed 255 characters",
    "any.required": "Password is required",
  }),
  // .valid() is the API-layer twin of the database CHECK constraint on role
  role: Joi.string().valid("member", "librarian").required().messages({
    "any.only": "Role must be either 'member' or 'librarian'",
    "string.empty": "Role cannot be empty",
    "any.required": "Role is required",
  }),
});

// Schema for POST /login (presence only - the stored password is the source of truth)
const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Username cannot be empty",
    "any.required": "Username is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
});

// Middleware: validate the registration request body
function validateRegistration(req, res, next) {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

// Middleware: validate the login request body
function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ error: errorMessage });
  }
  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
};
