const { Sequelize } = require('sequelize');
const chalk = require('chalk'); // 🔥 Chalk yahan bhi laye
require('dotenv').config();

const sequelize = new Sequelize(
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
    await sequelize.sync(); 
  } catch (error) {
    console.log(chalk.red('✖') + chalk.bold(' Database:  ') + chalk.redBright('Connection Failed!'));
    console.error(error);
  }
};

module.exports = { sequelize, connectDB };