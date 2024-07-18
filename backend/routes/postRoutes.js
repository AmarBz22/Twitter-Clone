const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); 
const path = require('path');

const {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} = require('../controllers/postController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4(); 
    const fileExtension = path.extname(file.originalname); 
    cb(null, `${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({ storage: storage });

// Routes
router.get('/all', authMiddleware, getAllPosts);
router.get('/following', authMiddleware, getFollowingPosts);
router.get('/likes/:id', authMiddleware, getLikedPosts);
router.get('/user/:username', authMiddleware, getUserPosts);
router.post('/create', authMiddleware, upload.single('img'), createPost);
router.post('/like/:id', authMiddleware, likeUnlikePost);
router.post('/comment/:id', authMiddleware, commentOnPost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
