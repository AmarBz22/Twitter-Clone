const express = require('express');
const router = express.Router();
const authMiddleware  =require("../middleware/authMiddleware.js");
const { signup, login, logout, getMe } = require('../controllers/authController');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/logout
router.post('/logout', logout);

router.get('/me',authMiddleware,getMe)

module.exports = router;
