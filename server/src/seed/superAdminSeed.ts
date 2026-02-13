/**
 * Super admin seed.
 * Ensures a single, known super admin account exists after DB connection so the
 * dashboard can always be accessed for initial setup. This runs at startup,
 * is idempotent, and refreshes the seed user's role/credentials if needed.
 */
import bcrypt from "bcrypt";
import { User } from "../models/User";

const SEED_USER = {
  name: "Ali hadi",
  email: "superadmin@gmail.com",
  password: "1234134",
  role: "super_admin" as const,
};

export async function seedSuperAdmin(): Promise<void> {
  const existing = await User.findOne({ email: SEED_USER.email });
  const hashed = await bcrypt.hash(SEED_USER.password, 10);

  if (!existing) {
    await User.create({
      ...SEED_USER,
      password: hashed,
      isActive: true,
      deletedAt: null,
    });
    return;
  }

  const shouldUpdate =
    existing.name !== SEED_USER.name || existing.role !== SEED_USER.role || !existing.isActive;

  if (shouldUpdate) {
    existing.name = SEED_USER.name;
    existing.role = SEED_USER.role;
    existing.isActive = true;
    existing.deletedAt = null;
  }

  existing.password = hashed;
  await existing.save();
}
