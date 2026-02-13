/**
 * Post Controller
 * ---------------
 * Handles HTTP layer for Post resources.
 *
 * Responsibilities:
 * - Manage CRUD endpoints for posts
 * - Handle list endpoints with filtering/sorting/pagination via service layer
 * - Provide endpoint to get posts by author
 *
 * Notes:
 * - Business logic lives in post.service.ts
 * - This layer only manages request/response flow
 */

import type { Request, Response } from "express";
import { unlink } from "fs/promises";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as postService from "../services/post.service";
import { isCloudinaryConfigured, uploadPostImage } from "../lib/cloudinary";

type FileRequest = Request & { file?: Express.Multer.File };

function buildFileUrl(req: Request, filename: string) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/posts/${filename}`;
}

export const createPost = asyncHandler(async (req: FileRequest, res: Response) => {
  const payload = { ...req.body } as Record<string, unknown>;

  if (req.file) {
    if (isCloudinaryConfigured()) {
      payload.image = await uploadPostImage(req.file.path);
      void unlink(req.file.path).catch(() => null);
    } else {
      payload.image = buildFileUrl(req, req.file.filename);
    }
  }

  const post = await postService.createPost(payload);
  res.status(201).json({ data: post });
});

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.getPosts(req.query);
  res.json(result);
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getPostById(String(req.params.id));
  res.json({ data: post });
});

export const updatePost = asyncHandler(async (req: FileRequest, res: Response) => {
  const payload = { ...req.body } as Record<string, unknown>;

  if (req.file) {
    if (isCloudinaryConfigured()) {
      payload.image = await uploadPostImage(req.file.path);
      void unlink(req.file.path).catch(() => null);
    } else {
      payload.image = buildFileUrl(req, req.file.filename);
    }
  }

  const post = await postService.updatePost(String(req.params.id), payload);
  res.json({ data: post });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await postService.deletePost(String(req.params.id));
  res.status(204).send();
});

export const getPostsByAuthor = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.getPostsByAuthor(String(req.params.authorId), req.query);
  res.json(result);
});
