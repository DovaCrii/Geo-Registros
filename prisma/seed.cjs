const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
    throw new Error("Seeding blocked in production. Set SEED_ALLOW_PRODUCTION=true only if you really mean it.");
  }

  const email = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "";
  const fullName = (process.env.SEED_ADMIN_FULL_NAME || "").trim();

  if (!email || !password || !fullName) {
    throw new Error("Missing SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD or SEED_ADMIN_FULL_NAME.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      hashedPassword,
      role: Role.ADMIN,
      active: true,
    },
    create: {
      email,
      fullName,
      hashedPassword,
      role: Role.ADMIN,
      active: true,
    },
  });

  console.log(`Seeded ADMIN user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
