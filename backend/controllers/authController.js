const User = require('../models/user');
const bcrypt = require('bcryptjs');
const generateTokenAndSetCookie = require('../utils/generateToken'); // Adjust path as necessary

const signup = async (req, res) => {
    const { fullName, username, email, password } = req.body;
  
    try {
      
  
      // Check if username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        const field = existingUser.username === username ? 'Username' : 'Email';
        return res.status(400).json({ error: `${field} already exists` });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const newUser = new User({
        fullName,
        username,
        email,
        password: hashedPassword,
      });
  
      // Save user to database
      await newUser.save();
  
      // Generate JWT token and set cookie
      generateTokenAndSetCookie(newUser._id, res);
  
      // Respond with user details
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } catch (error) {
      console.error('Error in signup:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

// Login controller
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateTokenAndSetCookie(user._id, res);

    // Respond with user details and token
    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Logout controller
const logout = async (req, res) => {
  try {
    res.cookie('token', '', { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ message: 'Logged out successfully' });
    console.log("Logged out successfully");
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getMe controller', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { signup, login, logout ,getMe};
