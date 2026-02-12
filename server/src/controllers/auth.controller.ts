/**
 * Auth Controller (JWT Authentication)
 * ------------------------------------
 * Handles authentication-related HTTP requests.
 *
 * Responsibilities:
 * - Register new users
 * - Log in users
 * - Return JWT tokens in responses
 *
 * Notes:
 * - Password hashing and token creation are handled in auth.service.ts
 * - Protected routes use auth middleware (protect + adminOnly)
 */
import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as authService from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
});
