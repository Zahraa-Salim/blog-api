/**
 * ID Validation Schemas
 * ---------------------
 * This file centralizes all Zod schemas related to MongoDB ObjectId validation.
 *
 * Purpose:
 * - Ensure route parameters that represent IDs are valid MongoDB ObjectIds
 * - Prevent invalid database queries before they reach controllers/services
 *
 * Used in routes like:
 * - GET /api/authors/:id
 * - GET /api/posts/:id
 * - GET /api/posts/author/:authorId
 */
import { z } from "zod";

/** Reusable ObjectId validator */
export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

/** Schema for routes using :id */
export const idParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

/** Schema for routes using :authorId */
export const authorIdParamSchema = z.object({
  params: z.object({
    authorId: objectId,
  }),
});
