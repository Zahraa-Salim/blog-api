/**
 * Loads environment variables from .env and exposes a single `env` object.
 * Purpose: Central place for runtime config (PORT, MONGO_URI, JWT settings).
 */
import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  await mongoose.connect(env.MONGO_URI);
  console.log("MongoDB Atlas connected");
}
