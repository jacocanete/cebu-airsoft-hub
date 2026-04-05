/**
 * CLI script to assign a site-wide role to a user.
 *
 * Usage:
 *   npx tsx server/src/scripts/grant-role.ts <username> <USER|MODERATOR|ADMIN>
 *
 * Examples:
 *   npx tsx server/src/scripts/grant-role.ts ghost_reaper ADMIN
 *   npx tsx server/src/scripts/grant-role.ts tac_pablo MODERATOR
 *   npx tsx server/src/scripts/grant-role.ts old_mod USER   # demote
 *
 * Must be run from the project root so .env is found by dotenv.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

type Role = "USER" | "MODERATOR" | "ADMIN";
const VALID_ROLES: Role[] = ["USER", "MODERATOR", "ADMIN"];

async function main() {
  const [, , username, roleArg] = process.argv;

  if (!username || !roleArg) {
    console.error("Usage: npx tsx server/src/scripts/grant-role.ts <username> <USER|MODERATOR|ADMIN>");
    process.exit(1);
  }

  const role = roleArg.toUpperCase() as Role;
  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role "${roleArg}". Must be one of: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, name: true, username: true, role: true },
    });

    if (!user) {
      console.error(`User "${username}" not found.`);
      process.exit(1);
    }

    if (user.role === role) {
      console.log(`"${username}" already has role ${role}. No change.`);
      process.exit(0);
    }

    const previous = user.role;
    await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    console.log(`✓ Updated "${username}" (${user.name}): ${previous} → ${role}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
