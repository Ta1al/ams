const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ClassModel = require('../models/Class');

const isValidObjectId = (value) => {
  return typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/);
};

const validateStudentClass = async ({ program, classId }) => {
  if (!program || !isValidObjectId(String(program))) {
    return { ok: false, status: 400, message: 'program is required for student and must be valid' };
  }
  if (!classId || !isValidObjectId(String(classId))) {
    return { ok: false, status: 400, message: 'class is required for student and must be valid' };
  }

  const classDoc = await ClassModel.findById(classId).select('program');
  if (!classDoc) {
    return { ok: false, status: 400, message: 'Class not found' };
  }

  if (String(classDoc.program) !== String(program)) {
    return { ok: false, status: 400, message: 'Class does not belong to the selected program' };
  }

  return { ok: true };
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('program', 'name')
      .populate('class', 'section session program')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('program', 'name')
      .populate('class', 'section session program')
      .populate('department', 'name');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, username, password, role, program, department, class: classId } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'name, username, password are required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === 'student') {
      const validation = await validateStudentClass({ program, classId });
      if (!validation.ok) {
        return res.status(validation.status).json({ message: validation.message });
      }
    }

    const user = await User.create({
      name,
      username,
      password: hashedPassword,
      role,
      program: role === 'student' ? program : undefined,
      class: role === 'student' ? classId : undefined,
      department: role === 'teacher' ? department : undefined,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, username, password, role, program, department, class: classId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Update fields
    user.name = name || user.name;
    user.username = username || user.username;
    user.role = role || user.role;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update program/department based on role
    if (user.role === 'student') {
      user.program = program || user.program;
      user.class = classId || user.class;
      user.department = undefined;

      const validation = await validateStudentClass({
        program: user.program,
        classId: user.class,
      });
      if (!validation.ok) {
        return res.status(validation.status).json({ message: validation.message });
      }
    } else if (user.role === 'teacher') {
      user.department = department || user.department;
      user.program = undefined;
      user.class = undefined;
    } else {
      user.program = undefined;
      user.department = undefined;
      user.class = undefined;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
