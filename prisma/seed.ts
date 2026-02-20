import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";
import { config } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Database...");

  // 1. Create Initial Admin User
  const initialAdminEmail = "admin@storykids.com";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: initialAdminEmail },
  });

  if (!existingAdmin) {
    const defaultPassword = "SuperSecretPassword123!"; // You should change this after first login!
    const passwordHash = await hash(defaultPassword);

    const admin = await prisma.adminUser.create({
      data: {
        name: "Super Admin",
        email: initialAdminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    console.log(`✅ Created initial admin user: ${admin.email}`);
    console.log(`🔑 Temporary Password: ${defaultPassword}`);
    console.log(`⚠️ Please log in and change this password immediately.`);
  } else {
    console.log(`ℹ️ Admin user ${initialAdminEmail} already exists. Skipping.`);
  }

  // 2. Create Default Categories
  const defaultCategories = ["Adventure", "Bedtime", "Educational", "Fantasy"];
  for (const categoryName of defaultCategories) {
    const existingCategory = await prisma.storyCategory.findUnique({
      where: { name: categoryName },
    });

    if (!existingCategory) {
      const slug = categoryName.toLowerCase().replace(/\\s+/g, "-");
      await prisma.storyCategory.create({
        data: {
          name: categoryName,
          slug,
          description: `Stories related to ${categoryName}`,
        },
      });
      console.log(`✅ Created category: ${categoryName}`);
    } else {
      console.log(`ℹ️ Category ${categoryName} already exists. Skipping.`);
    }
  }

  console.log("🌱 Seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
