const { Sequelize } = require('sequelize');
const chalk = require('chalk'); 
require('dotenv').config();

// 🚀 NAYA LOGIC: Agar Render par DATABASE_URL hai, toh wo use kare
// Warna aapke computer (localhost) ke liye purane variables use kare
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,             // 👈 Cloud DB (Neon) ke liye ye mandatory hai
          rejectUnauthorized: false  // 👈 Render/Neon SSL errors bypass karne ke liye
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false, 
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // 🔥 Clean DB success log
    console.log(chalk.green('✔') + chalk.bold(' Database:  ') + chalk.greenBright('PostgreSQL Connected'));
    
    // NOTE: Production mein alter: true ya force: true carefully use karna chahiye, 
    // par abhi ke liye .sync() theek hai naye tables banane ke liye.
    await sequelize.sync(); 
  } catch (error) {
    console.log(chalk.red('✖') + chalk.bold(' Database:  ') + chalk.redBright('Connection Failed!'));
    console.error(error);
  }
};

module.exports = { sequelize, connectDB };