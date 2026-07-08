import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function main() {
  console.log("Connecting to:", connectionString);
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await prisma.project.count();
    console.log("Total projects:", count);
    
    const projects = await prisma.project.findMany();
    console.log("Projects:", JSON.stringify(projects, null, 2));

    const settings = await prisma.siteSetting.findMany();
    console.log("Settings:", JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Error connecting or querying:", error);
  } finally {
    await pool.end();
  }
}

main();
