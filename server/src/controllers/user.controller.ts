/**
 * User Controller
 * ---------------
 * Admin dashboard endpoint to list system users (admin accounts).
 * Requires JWT auth.
 */
import { asyncHandler } from "../middlewares/asyncHandler";
import { User } from "../models/User";
import { ApiFeatures } from "../utils/apiFeatures";
import { AppError } from "../utils/AppError";

export const getUsers = asyncHandler(async (req, res) => {
  // default behavior: return only active admin users
  const baseQuery = User.find({ isActive: true, role: { $in: ["admin", "super_admin"] } })
    .select("-password")
    .lean();

  const features = new ApiFeatures(baseQuery, req.query)
    .search(["name", "email"])
    .sort("-createdAt")
    .paginate(10, 100);

  const countQuery = new ApiFeatures(
    User.find({ isActive: true, role: { $in: ["admin", "super_admin"] } }),
    req.query
  ).search(["name", "email"]);

  const [total, users] = await Promise.all([
    countQuery.query.countDocuments(),
    features.query,
  ]);

  res.json({
    page: features.page,
    limit: features.limit,
    total,
    totalPages: Math.max(Math.ceil(total / features.limit), 1),
    results: users.length,
    data: users,
  });
});

/**
 * Deactivate user (soft delete)
 * PATCH /api/users/:id
 * - sets isActive=false
 * - sets deletedAt=now
 */
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, deletedAt: new Date() },
    { new: true }
  )
    .select("-password")
    .lean();

  if (!user) throw new AppError("User not found", 404);

  res.json({ data: user });
});

/**
 * Update admin role
 * PATCH /api/users/:id/role
 * - sets role to "admin" or "super_admin"
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body as { role: "admin" | "super_admin" };

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    .select("-password")
    .lean();

  if (!user) throw new AppError("User not found", 404);

  res.json({ data: user });
});
