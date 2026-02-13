/**
 * Post routes.
 * Purpose: Maps /api/posts endpoints to controller functions + validation middleware.
 * Includes nested-like route: GET /api/posts/author/:authorId
 */

import { Router } from "express";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  updatePost,
  getPostsByAuthor,
} from "../controllers/post.controller";
import { protect, adminOnly } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createPostSchema, updatePostSchema } from "../middlewares/schemas";
import { idParamSchema, authorIdParamSchema } from "../middlewares/ids";
import { uploadPostImage } from "../middlewares/upload";
import { normalizePostPayload } from "../middlewares/normalizePostPayload";

const router = Router();

// Protect everything in this router:
router.use(protect);

router.post(
  "/",
  adminOnly,
  uploadPostImage.single("image"),
  normalizePostPayload,
  validate(createPostSchema),
  createPost
);
router.get("/", getPosts);
router.get("/author/:authorId", validate(authorIdParamSchema), getPostsByAuthor);
router.get("/:id", validate(idParamSchema), getPostById);
router.patch(
  "/:id",
  adminOnly,
  validate(idParamSchema),
  uploadPostImage.single("image"),
  normalizePostPayload,
  validate(updatePostSchema),
  updatePost
);
router.delete("/:id", adminOnly, validate(idParamSchema), deletePost);

export default router;
