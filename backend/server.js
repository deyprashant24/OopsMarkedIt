const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const chalk = require('chalk'); // 🔥 Chalk import kiya
require('dotenv').config();

const { connectDB } = require('./config/db');
require('./config/passport'); // Initialize Google Strategy

const authRoutes = require('./routes/auth.routes');
const bookmarkRoutes = require('./routes/bookmark.routes'); // 👈 Naya Bookmark route import kiya
const collectionRoutes = require('./routes/collection.routes'); // 👈 Naya Collection route import kiya

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://oopsmarkedit.vercel.app', // 👈 Yahan aayega Vercel ka URL!
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Connect Database
connectDB();

// Initialize Models and Relationships
require('./models'); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes); // 👈 API mein route register kiya
app.use('/api/collections', collectionRoutes)

app.get('/', (req, res) => {
  res.send('OopsMarkedIt Backend is running! 🚀');
});

const PORT = process.env.PORT || 5012; 

app.listen(PORT, () => {
  // 🔥 Pro Level Terminal Logging
  console.log('\n' + chalk.bgBlue.white.bold(' 🚀 OOPSMARKED-IT SYSTEM ONLINE '));
  console.log(chalk.cyan('➜') + chalk.bold(' Server:    ') + chalk.green.underline(`http://localhost:${PORT}`));
  console.log(chalk.cyan('➜') + chalk.bold(' Mode:      ') + chalk.yellow(process.env.NODE_ENV || 'development'));
  console.log(chalk.cyan('➜') + chalk.bold(' Time:      ') + chalk.gray(new Date().toLocaleTimeString()) + '\n');
});