/**
 * Auth Service (JWT Authentication)
 * ---------------------------------
 * Handles authentication logic and security-related operations.
 *
 * Responsibilities:
 * - Hash passwords using bcrypt
 * - Validate user credentials during login
 * - Generate JWT tokens
 * - Enforce authentication rules
 *
 * Notes:
 * - Does NOT send HTTP responses (handled by controller)
 * - Uses JWT_SECRET and JWT_EXPIRES_IN from environment config
 */

import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

function signToken(payload: { userId: string; role: string }) {
  const secret: Secret = env.JWT_SECRET as Secret;
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}

export async function register(data: { name: string; email: string; password: string; role?: "admin" | "super_admin" }) {
  const { name, email, password, role } = data;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already in use", 409);

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: role ?? "admin",
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

export async function login(data: { email: string; password: string }) {
  const { email, password } = data;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid email or password", 401);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError("Invalid email or password", 401);

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}
