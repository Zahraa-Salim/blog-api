/**
 * Application entry point.
 * Purpose: Connect to the database, run any required startup seeds (such as
 * ensuring a super admin exists), and then start the HTTP server so the API is
 * ready for incoming requests. Startup errors are logged and exit the process
 * to avoid running with a partially initialized state.
 */
import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { seedSuperAdmin } from "./seed/superAdminSeed";

async function start() {
  await connectDB();
  await seedSuperAdmin();
  app.listen(env.PORT, () =>
    console.log(`Server running on http://localhost:${env.PORT}`)
  );
}

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
