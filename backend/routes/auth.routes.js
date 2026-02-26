const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.Controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');

const router = express.Router();

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'), 
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
];

// Public Auth Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:resetToken', authController.resetPassword);

// Protected Auth Routes (Require Login)
router.get('/me', protect, authController.getMe); 

// 🚀 NAYE SETTINGS PAGE WALE ROUTES 
router.put('/updatedetails', protect, authController.updateDetails);
router.put('/updatepassword', protect, authController.updatePassword);
router.delete('/deleteaccount', protect, authController.deleteAccount);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  authController.googleAuthCallback 
);

module.exports = router;