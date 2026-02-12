/**
 * Author Mongoose model.
 * Purpose: Defines Author schema (name, email, bio) and handles DB operations for authors.
 */
import { Schema, model } from "mongoose";

const authorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, default: "" },

    // soft delete fields
    status: { type: String, enum: ["active", "deleted"], default: "active" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// helpful indexes
authorSchema.index({ status: 1, createdAt: -1 });
authorSchema.index({ email: 1 });
authorSchema.index({ name: 1 });

export const Author = model("Author", authorSchema);
