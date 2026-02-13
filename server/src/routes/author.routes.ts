/**
 * Author routes.
 * Purpose: Maps /api/authors endpoints to controller functions + validation middleware.
 */

import { Router } from "express";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from "../controllers/author.controller";
import { protect, adminOnly } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../middlewares/ids";
import { createAuthorSchema, updateAuthorSchema } from "../middlewares/schemas";

const router = Router();

// Protect everything in this router:
router.use(protect);

router.post("/", adminOnly, validate(createAuthorSchema), createAuthor);
router.get("/", getAuthors);
router.get("/:id", validate(idParamSchema), getAuthorById);
router.patch("/:id", adminOnly, validate(idParamSchema), validate(updateAuthorSchema), updateAuthor);
router.delete("/:id", adminOnly, validate(idParamSchema), deleteAuthor);

export default router;
