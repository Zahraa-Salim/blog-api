/**
 * MongoDB connection via Mongoose.
 * Purpose: Connect once on server startup; fail fast if connection fails.
 */
import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  MONGO_URI: process.env.MONGO_URI || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "",
 JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

if (!env.MONGO_URI) {
  throw new Error("MONGO_URI missing in .env file");
}
