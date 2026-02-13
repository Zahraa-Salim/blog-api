/**
 * Normalizes post payloads coming from multipart/form-data.
 * Converts tags from string to array so validation can pass.
 */

import type { Request, Response, NextFunction } from "express";

function parseTags(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.filter((tag) => typeof tag === "string");
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((tag) => typeof tag === "string");
    } catch {
      return trimmed.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  }

  return trimmed.split(",").map((tag) => tag.trim()).filter(Boolean);
}

export function normalizePostPayload(req: Request, _res: Response, next: NextFunction) {
  if (req.body && "tags" in req.body) {
    const parsed = parseTags(req.body.tags);
    if (parsed) {
      req.body.tags = parsed;
    }
  }

  next();
}
