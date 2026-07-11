import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DATABASE_URL"];
const directUrl = process.env["DIRECT_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required in the environment.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
    directUrl: directUrl ?? databaseUrl,
  },
});
