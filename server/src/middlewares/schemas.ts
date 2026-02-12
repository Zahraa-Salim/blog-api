/**
 * Request Body Validation Schemas
 * --------------------------------
 * This file centralizes all Zod schemas for validating request bodies.
 *
 * Purpose:
 * - Validate incoming data before it reaches controllers/services
 * - Enforce required fields and data formats
 * - Improve API reliability and error messaging
 *
 * Covers:
 * - Authors
 * - Posts
 * - Authentication (register/login)
 */

import { z } from "zod";
import { objectId } from "./ids";

//
// ===== Author Schemas =====
//

export const createAuthorSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    bio: z.string().optional(),
  }),
});

export const updateAuthorSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    bio: z.string().optional(),
  }),
});

//
// ===== Post Schemas =====
//

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    image: z.string().url("Image must be a valid URL").optional(),
    status: z.enum(["draft", "published","deleted"]).optional(),
    tags: z.array(z.string()).optional(),
    author: objectId,
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    content: z.string().min(10).optional(),
    image: z.string().url("Image must be a valid URL").optional(),
    status: z.enum(["draft", "published","deleted"]).optional(),
    tags: z.array(z.string()).optional(),
    author: objectId.optional(),
  }),
});

//
// ===== Auth Schemas =====
//

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "super_admin"]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

//
// ===== User Admin Schemas =====
//

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "super_admin"]),
  }),
});
