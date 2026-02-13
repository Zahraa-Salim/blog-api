/**
 * User Mongoose model (BONUS - JWT auth).
 * Purpose: Stores admin/user credentials for login (hashed password) and role-based access.
 */

import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["super_admin", "admin"], default: "admin" }, // admin-only system

    // soft disable user (recommended for dashboards)
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// helpful indexes
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
userSchema.index({ name: 1 });

export const User = model("User", userSchema);
