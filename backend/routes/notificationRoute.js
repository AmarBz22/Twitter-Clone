const express = require('express');
const {getNotifications,deleteNotifications}= require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.get("/", authMiddleware, getNotifications);
router.delete("/", authMiddleware, deleteNotifications);

module.exports = router;
