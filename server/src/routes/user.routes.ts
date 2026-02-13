/**
 * User routes.
 * Purpose: Admin-only endpoints for listing system users.
 */

import { Router } from "express";
import { getUsers, deactivateUser, updateUserRole } from "../controllers/user.controller";
import { protect, superAdminOnly } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../middlewares/ids";
import { updateUserRoleSchema } from "../middlewares/schemas";

const router = Router();

// protect everything in this router
router.use(protect);

// list users (admin dashboard)
router.get("/", superAdminOnly, getUsers);

// deactivate user (soft delete)
router.patch("/:id", superAdminOnly, validate(idParamSchema), deactivateUser);

// update admin role
router.patch("/:id/role", superAdminOnly, validate(idParamSchema), validate(updateUserRoleSchema), updateUserRole);

export default router;
