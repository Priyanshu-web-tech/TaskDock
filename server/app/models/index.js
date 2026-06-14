"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
require("dotenv").config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.resolve(__dirname, "../config/config.js"))[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: env === "development", 
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || 30, 10),
      min: parseInt(process.env.DB_POOL_MIN || 0, 10),
      acquire: parseInt(process.env.DB_ACQUIRE || 1000000, 10),
      idle: parseInt(process.env.DB_IDLE || 200000, 10),
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === "true", 
    },
    define: {
      timestamps: true,
      underscored: false, 
    },
  }
);

// Import models
fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.endsWith(".js")
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Setup Model associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
})();

if(env !== "production") {
  // Sync database
  (async () => {
    try {
      await sequelize.sync({ alter: true, logging: false }); 
      console.log("Database & tables synchronized successfully.");
    } catch (error) {
      console.log(error)
      console.error("Error synchronizing database:", error.message);
    }
  })();
}


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
