const authService = require('../services/auth.service');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 

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

    // 🚀 UPDATED: Cross-domain cookies ke liye settings
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,      // Vercel-Render ke liye true hona zaroori hai
      sameSite: 'none',  // Cross-origin request ke liye 'none' zaroori hai
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
  // 🚀 UPDATED: Logout mein bhi same flags hone chahiye tabhi cookie delete hogi
  res.cookie('token', '', { 
    httpOnly: true, 
    expires: new Date(0),
    secure: true, 
    sameSite: 'none' 
  });
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

    // 🚀 UPDATED: Hardcoded localhost ki jagah dynamic Vercel URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

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

    user.password = req.body.password; 
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Google OAuth Callback
exports.googleAuthCallback = (req, res) => {
  const user = req.user;
  
  // 🚀 UPDATED: Dynamic Frontend URL for Redirects
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!user) {
    return res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );

  // 🚀 UPDATED: Cross-domain cookie settings for Google Login
  res.cookie('token', token, {
    httpOnly: true,
    secure: true, 
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  res.redirect(`${frontendUrl}/dashboard`);
};

// @desc    Protect routes (Middleware)
exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// ==========================================
// 🚀 SETTINGS PAGE WALE FUNCTIONS
// ==========================================

// @desc    Update user details (Name)
exports.updateDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

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
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { include: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Google logged-in users cannot change password here.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword; 
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete User Account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();
    
    // 🚀 UPDATED: Account delete karne par bhi cookie properly clear karni hogi
    res.cookie('token', '', { 
      httpOnly: true, 
      expires: new Date(0),
      secure: true,
      sameSite: 'none'
    });

    res.status(200).json({ success: true, message: 'Account deleted permanently' });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};