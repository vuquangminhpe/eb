// src/config/db.js
const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
}

module.exports = connectDB;
