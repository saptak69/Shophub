const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', validate(registerSchema), registerUser);

// POST /api/auth/login - Authenticate existing users
router.post('/login', validate(loginSchema), loginUser);

module.exports = router;
