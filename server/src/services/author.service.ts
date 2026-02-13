/**
 * Author Service
 * --------------
 * Business logic and data access layer for Author resource.
 *
 * Responsibilities:
 * - Interact with Author model (MongoDB)
 * - Apply filtering, searching, sorting, and pagination
 * - Throw application-level errors when needed (e.g., not found)
 *
 * Notes:
 * - Called by author.controller.ts
 * - Does NOT know anything about HTTP (req/res)
 */

import { Author } from "../models/Author";
import { Post } from "../models/Post";
import { AppError } from "../utils/AppError";
import { ApiFeatures } from "../utils/apiFeatures";

export async function createAuthor(data: any) {
  // ensure new authors are active (soft delete fields)
  const payload = { ...data, status: "active", deletedAt: null };
  return Author.create(payload);
}

export async function getAuthors(query: any) {
  // exclude deleted authors by default
  const baseQuery = Author.find({ status: { $ne: "deleted" } }).lean();

  const features = new ApiFeatures(baseQuery, query)
    .filter(["name", "email"])
    .search(["name", "email"])
    .sort("-createdAt")
    .paginate(10, 100);

  const countQuery = new ApiFeatures(Author.find({ status: { $ne: "deleted" } }), query)
    .filter(["name", "email"])
    .search(["name", "email"]);

  const [total, authors] = await Promise.all([
    countQuery.query.countDocuments(),
    features.query,
  ]);

  return {
    page: features.page,
    limit: features.limit,
    total,
    totalPages: Math.max(Math.ceil(total / features.limit), 1),
    results: authors.length,
    data: authors,
  };
}

export async function getAuthorById(id: string) {
  // treat deleted author as not found
  const author = await Author.findOne({ _id: id, status: { $ne: "deleted" } }).lean();
  if (!author) throw new AppError("Author not found", 404);
  return author;
}

export async function updateAuthor(id: string, data: any) {
  // prevent updating deleted authors
  const author = await Author.findOneAndUpdate(
    { _id: id, status: { $ne: "deleted" } },
    data,
    { new: true, runValidators: true }
  );

  if (!author) throw new AppError("Author not found", 404);
  return author;
}

export async function deleteAuthor(id: string) {
  // 1) make sure author exists and is not already deleted
  const author = await Author.findOne({ _id: id, status: { $ne: "deleted" } });
  if (!author) throw new AppError("Author not found", 404);

  // 2) block delete if author still has non-deleted posts
  const activePostsCount = await Post.countDocuments({
    author: author._id,
    status: { $ne: "deleted" },
  });

  if (activePostsCount > 0) {
    throw new AppError(
      "Cannot delete author: this author still has posts. Delete the author's posts first.",
      400
    );
  }

  // 3) soft delete author
  author.status = "deleted";
  author.deletedAt = new Date();
  await author.save();

  return author;
}
