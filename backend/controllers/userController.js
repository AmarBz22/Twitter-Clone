const User = require('../models/user.js');
const Post = require('../models/Post.js');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');

const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log('Error in getUserProfile:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow/unfollow yourself" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch users followed by the current user
    const currentUser = await User.findById(userId).select("following");
    const usersFollowedByMe = currentUser.following;

    // Exclude users already followed by the current user and select random users
    const users = await User.aggregate([
      {
        $match: {
          _id: { $nin: [userId, ...usersFollowedByMe] }, // Exclude current user and users already followed
        },
      },
      { $sample: { size: 10 } }, // Sample 10 random users
    ]);

    
    const suggestedUsers = users.slice(0, 4).map(user => ({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profileImg: user.profileImg,
    }));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  const userId = req.user._id;

  console.log('Received update request for user:', userId);
  console.log('Request body:', req.body);

  try {
    let user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: "User not found" });
    }

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      console.log('Password change requires both current and new password');
      return res.status(400).json({ error: "Please provide both current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        console.log('Current password is incorrect');
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        console.log('New password is too short');
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      console.log('Password updated');
    }

    if (req.files && req.files.profileImg) {
      if (user.profileImg) {
        console.log('Deleting old profile image from Cloudinary');
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      const result = await cloudinary.uploader.upload(req.files.profileImg[0].path);
      user.profileImg = result.secure_url;
      console.log('New profile image uploaded:', user.profileImg);
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();
    console.log('User updated:', user);

    // Exclude password from the response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  const userId = req.user._id;

  try {
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 }); // Assuming 'Post' model has 'user' field
    res.status(200).json(posts);
  } catch (error) {
    console.log('Error fetching user posts:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUser, getUserPosts };
