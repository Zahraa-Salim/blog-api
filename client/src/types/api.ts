/**
 * Shared API type definitions.
 * Declares response models and domain entities used across the frontend codebase.
 */

export type Order = "asc" | "desc";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: number;
  data: T[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  status: "active" | "deleted";
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorRef {
  _id: string;
  name: string;
  email: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  status: "draft" | "published" | "deleted";
  tags: string[];
  author: AuthorRef | null;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorPayload {
  name: string;
  email: string;
  bio?: string;
}

export interface PostPayload {
  title: string;
  slug: string;
  content: string;
  status?: "draft" | "published";
  tags?: string[];
  author: string;
  image?: string;
}

export type ApiQuery = Record<string, string | number | undefined | null>;
