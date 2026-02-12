/**
 * Query helper for list endpoints.
 * Purpose: Reusable filtering, searching, sorting, and pagination across resources.
 * Used in GET /api/posts and GET /api/authors.
 */
import type { Query } from "mongoose";

export class ApiFeatures {
  public query: Query<any, any>;
  public reqQuery: any;

  public page = 1;
  public limit = 10;
  public skip = 0;

  constructor(query: Query<any, any>, reqQuery: any) {
    this.query = query;
    this.reqQuery = reqQuery;
  }

  filter(allowedFields: string[] = []) {
    const q: Record<string, any> = { ...this.reqQuery };

    // remove non-filter params
    ["page", "limit", "sort", "order", "q"].forEach((k) => delete q[k]);

    // allow only selected fields
    if (allowedFields.length) {
      for (const key of Object.keys(q)) {
        if (!allowedFields.includes(key)) delete q[key];
      }
    }

    // special case: tag -> tags (array field)
    if (q.tag) {
      q.tags = q.tag;
      delete q.tag;
    }

    this.query = this.query.find(q);
    return this;
  }

  search(fields: string[] = []) {
    const q = String(this.reqQuery.q || "").trim();
    if (!q || fields.length === 0) return this;

    this.query = this.query.find({
      $or: fields.map((f) => ({ [f]: { $regex: q, $options: "i" } })),
    });

    return this;
  }

  sort(defaultSort = "-createdAt") {
    const sortField = String(this.reqQuery.sort || "");
    const order = String(this.reqQuery.order || "desc").toLowerCase() === "asc" ? "" : "-";

    this.query = sortField ? this.query.sort(`${order}${sortField}`) : this.query.sort(defaultSort);
    return this;
  }

  paginate(defaultLimit = 10, maxLimit = 100) {
    this.page = Math.max(parseInt(String(this.reqQuery.page || "1"), 10), 1);
    this.limit = Math.min(
      Math.max(parseInt(String(this.reqQuery.limit || String(defaultLimit)), 10), 1),
      maxLimit
    );
    this.skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(this.skip).limit(this.limit);
    return this;
  }
}
