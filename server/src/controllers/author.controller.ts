/**
 * Author Controller
 * -----------------
 * Handles HTTP layer for Author resources.
 * 
 * Responsibilities:
 * - Receive HTTP requests from routes
 * - Read req.params, req.query, req.body
 * - Call Author Service functions
 * - Send formatted JSON responses with proper status codes
 *
 * Notes:
 * - Does NOT contain database logic
 * - Errors are handled by asyncHandler + global errorHandler middleware
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import * as authorService from "../services/author.service";

export const createAuthor = asyncHandler(async (req: Request, res: Response) => {
  const author = await authorService.createAuthor(req.body);
  res.status(201).json({ data: author });
});

export const getAuthors = asyncHandler(async (req: Request, res: Response) => {
  const result = await authorService.getAuthors(req.query);
  res.json(result);
});

export const getAuthorById = asyncHandler(async (req: Request, res: Response) => {
  const author = await authorService.getAuthorById(String(req.params.id));
  res.json({ data: author });
});

export const updateAuthor = asyncHandler(async (req: Request, res: Response) => {
  const author = await authorService.updateAuthor(String(req.params.id), req.body);
  res.json({ data: author });
});

export const deleteAuthor = asyncHandler(async (req: Request, res: Response) => {
  await authorService.deleteAuthor(String(req.params.id));
  res.status(204).send();
});
