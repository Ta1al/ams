const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const normalizedUsername = (username || '').trim();

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check for user
    const user = await User.findOne({ username: normalizedUsername });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        _id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        program: user.program,
        class: user.class,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
};
