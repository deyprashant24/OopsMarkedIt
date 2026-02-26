const authService = require('../services/auth.service');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // 👈 Password compare aur hash karne ke liye naya import

// @desc    Register a new user
exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user & get token
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const { user, token } = await authService.loginUser(email, password);

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Logged-in User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// @desc    Logout user
exports.logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot Password Request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save(); // Token and Expire save ho jayenge

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You have requested a password reset for your OopsMarkedIt account. \n\nPlease click the link below to reset it: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - OopsMarkedIt',
        message: message,
      });
      res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Reset Password via Token
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  try {
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [require('sequelize').Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Naya password set karein (Hook automatically hash karega)
    user.password = req.body.password; 
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    
    // Save zaroori hai hook trigger karne ke liye
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Google OAuth Callback
exports.googleAuthCallback = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect('http://localhost:5173/login?error=auth_failed');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // Testing ke liye false
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  res.redirect('http://localhost:5173/dashboard');
};

// @desc    Protect routes (Middleware)
// Note: Usually ye ek alag middleware file mein hota hai, but aapne yahan rakha hai toh main isko yahi rakh raha hu.
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info (id, role) from payload to request object
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// ==========================================
// 🚀 NAYE SETTINGS PAGE WALE FUNCTIONS YAHAN HAIN
// ==========================================

// @desc    Update user details (Name)
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Sirf name update karenge
    user.name = req.body.name || user.name;
    await user.save();

    res.status(200).json({ 
      success: true, 
      data: user, 
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    console.error("Update Details Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // 1. User ko nikalo DB se aur explicitly 'password' field ko shamil karo (agar wo hidden hai)
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { include: ['password'] } // 👈 Ye bohot zaroori hai
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Google logged-in users cannot change password here.' });
    }

    // 2. Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // 3. Naya plain password assign karo.
    // Aapke User model ka hook isko automatically hash kar dega (jaise resetPassword mein karta hai)
    user.password = newPassword; 
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete User Account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // User delete kar do
    // NOTE: Agar aapke models mein "onDelete: 'CASCADE'" set hai, toh iske marks/collections auto delete ho jayenge.
    await user.destroy();
    
    // Cookie bhi clear kar do logout effect ke liye
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });

    res.status(200).json({ success: true, message: 'Account deleted permanently' });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};