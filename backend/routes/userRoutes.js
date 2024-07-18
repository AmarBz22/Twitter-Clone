const express = require('express');
const { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser,getUserPosts } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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

router.get('/profile/:username', authMiddleware, getUserProfile);
router.post('/follow/:id', authMiddleware, followUnfollowUser);
router.get('/suggested', authMiddleware, getSuggestedUsers);
router.get('/userPost',authMiddleware,getUserPosts);
router.put('/update', authMiddleware, upload.fields([{ name: 'profileImg', maxCount: 1 }, { name: 'coverImg', maxCount: 1 }]), updateUser);

module.exports = router;
