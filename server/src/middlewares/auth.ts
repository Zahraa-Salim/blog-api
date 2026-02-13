/**
 * Authentication & Authorization Middleware
 * -----------------------------------------
 * This file provides security middleware for protecting API routes using JWT.
 *
 * Responsibilities:
 * - Verify that incoming requests include a valid JWT token
 * - Decode the token and attach user info to the request object
 * - Restrict access to admin-only or super-admin-only routes
 *
 * Middlewares:
 *
 * 1. protect
 *    - Checks for "Authorization: Bearer <token>" header
 *    - Verifies the JWT using the server secret
 *    - Attaches { userId, role } to req.user
 *    - Blocks request if token is missing, invalid, or expired
 *
 * 2. adminOnly
 *    - Allows access if req.user.role is "admin" or "super_admin"
 *    - Used to restrict create/update/delete operations for authorized staff
 *
 * 3. superAdminOnly
 *    - Allows access only if req.user.role === "super_admin"
 *    - Used to lock down admin management endpoints
 *
 * Notes:
 * - Used after login/register when JWT authentication is enabled
 * - Works together with auth.service.ts (token creation)
 * - Ensures only authorized users can access protected resources
 */

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export function protect(req: AuthRequest, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AppError("Not authorized (missing token)", 401);
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

export function adminOnly(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    throw new AppError("Forbidden (admin only)", 403);
  }
  next();
}

export function superAdminOnly(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== "super_admin") {
    throw new AppError("Forbidden (super admin only)", 403);
  }
  next();
}
