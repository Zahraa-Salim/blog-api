/**
 * Post Mongoose model.
 * Purpose: Defines Post schema and the relation: Post.author -> Author (ObjectId ref).
 */
import { Schema, model, Types } from "mongoose";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    content: { type: String, required: true, minlength: 10 },
    image: { type: String, default: DEFAULT_POST_IMAGE, trim: true },

    // add "deleted" status
    status: { type: String, enum: ["draft", "published", "deleted"], default: "draft" },

    tags: { type: [String], default: [] },

    // relation
    author: { type: Types.ObjectId, ref: "Author", required: true },

    publishedAt: { type: Date, default: null },

    // soft delete timestamp
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// helpful indexes
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ title: 1 });
postSchema.index({ tags: 1 });

export const Post = model("Post", postSchema);
