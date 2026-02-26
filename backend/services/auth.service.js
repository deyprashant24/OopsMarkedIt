const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
  const { name, email, password } = userData; // <-- Updated

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });
  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new Error('Invalid credentials (User not found)');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials (Password wrong)');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return { user, token };
};

module.exports = { registerUser, loginUser };