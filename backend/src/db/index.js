import mongoose, { connect } from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";
const app = express();
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGO DB Connected \n DB Host:${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log("ERROR : MongoDB connection failed", err);
    process.exit(1);
  }
};

export default connectDB;
