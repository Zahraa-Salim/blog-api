/**
 * Post Service
 * ------------
 * Business logic and data access layer for Post resource.
 *
 * Responsibilities:
 * - Create, update, delete posts
 * - Automatically manage publishedAt field
 * - Apply advanced querying (filter, search, sort, paginate)
 * - Handle posts by specific author
 *
 * Notes:
 * - Uses ApiFeatures utility for reusable query logic
 * - Called by post.controller.ts
 */

import { Types } from "mongoose";
import { Post } from "../models/Post";
import { AppError } from "../utils/AppError";
import { ApiFeatures } from "../utils/apiFeatures";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80";

export async function createPost(data: any) {
  const payload = { ...data };

  // Prevent creating a "deleted" post directly (optional safety)
  if (payload.status === "deleted") {
    throw new AppError("Cannot create a post with status 'deleted'", 400);
  }

  // auto publishedAt
  if (payload.status === "published" && !payload.publishedAt) payload.publishedAt = new Date();
  if (payload.status === "draft") payload.publishedAt = null;

  // ensure deletedAt stays null on create
  payload.deletedAt = null;
  payload.image = payload.image?.trim() || DEFAULT_POST_IMAGE;

  const post = await Post.create(payload);
  return Post.findById(post._id).populate("author", "name email").lean();
}

export async function getPosts(query: any) {
  // Map authorId → author (so frontend can use either)
  if (query.authorId && !query.author) {
    query.author = query.authorId;
  }

  const baseQuery = Post.find({ status: { $ne: "deleted" } })
    .populate("author", "name email")
    .lean();

  const features = new ApiFeatures(baseQuery, query)
    .filter(["status", "author", "tag"]) // author now works via authorId too
    .search(["title", "content", "slug"])
    .sort("-createdAt")
    .paginate(10, 100);

  const countQuery = new ApiFeatures(Post.find({ status: { $ne: "deleted" } }), query)
    .filter(["status", "author", "tag"])
    .search(["title", "content", "slug"]);

  const [total, posts] = await Promise.all([
    countQuery.query.countDocuments(),
    features.query,
  ]);

  return {
    page: features.page,
    limit: features.limit,
    total,
    totalPages: Math.max(Math.ceil(total / features.limit), 1),
    results: posts.length,
    data: posts,
  };
}


export async function getPostById(id: string) {
  // treat deleted posts as "not found"
  const post = await Post.findOne({ _id: id, status: { $ne: "deleted" } })
    .populate("author", "name email")
    .lean();
  if (!post) throw new AppError("Post not found", 404);
  return post;
}

export async function updatePost(id: string, data: any) {
  const payload = { ...data };

  if ("image" in payload) {
    payload.image = payload.image?.trim() || DEFAULT_POST_IMAGE;
  }

  // If status is being updated to deleted, enforce deletedAt and clear publishedAt
  if (payload.status === "deleted") {
    payload.deletedAt = new Date();
    payload.publishedAt = null;
  }

  // Normal publish/draft behavior
  if (payload.status === "published") {
    payload.publishedAt = new Date();
    payload.deletedAt = null; // published implies not deleted
  }
  if (payload.status === "draft") {
    payload.publishedAt = null;
    payload.deletedAt = null; // draft implies not deleted
  }

  const post = await Post.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } }, // don't update already deleted posts
    payload,
    { new: true, runValidators: true }
  )
    .populate("author", "name email")
    .lean();

  if (!post) throw new AppError("Post not found", 404);
  return post;
}

export async function deletePost(id: string) {
  // SOFT DELETE: mark as deleted instead of removing from DB
  const post = await Post.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } },
    { status: "deleted", deletedAt: new Date(), publishedAt: null },
    { new: true }
  );

  if (!post) throw new AppError("Post not found", 404);
  return post;
}

export async function getPostsByAuthor(authorId: string, query: any) {
  if (!Types.ObjectId.isValid(authorId)) throw new AppError("Invalid author id", 400);

  const authorObjectId = new Types.ObjectId(authorId);

  // exclude deleted posts by default
  const baseQuery = Post.find({ author: authorObjectId, status: { $ne: "deleted" } })
    .populate("author", "name email")
    .lean();

  const features = new ApiFeatures(baseQuery, query)
    .filter(["status", "tag"])
    .search(["title", "content", "slug"])
    .sort("-createdAt")
    .paginate(10, 100);

  const countQuery = new ApiFeatures(
    Post.find({ author: authorObjectId, status: { $ne: "deleted" } }),
    query
  )
    .filter(["status", "tag"])
    .search(["title", "content", "slug"]);

  const [total, posts] = await Promise.all([
    countQuery.query.countDocuments(),
    features.query,
  ]);

  return {
    author: authorId,
    page: features.page,
    limit: features.limit,
    total,
    totalPages: Math.max(Math.ceil(total / features.limit), 1),
    results: posts.length,
    data: posts,
  };
}
