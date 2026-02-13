/**
 * Auth routes (BONUS - JWT auth).
 * Purpose: Maps /api/auth/register and /api/auth/login with body validation.
 */

import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../middlewares/schemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;

