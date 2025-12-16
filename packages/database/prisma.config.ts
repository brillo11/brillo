import { defineConfig } from "@prisma/config";
import fs from "fs";
import path from "path";

// Parse .env manually or use loadEnvFile if available
// Since we know we are in packages/database, the root .env is at ../../.env
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath) && process.loadEnvFile) {
  process.loadEnvFile(envPath);
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
    // directUrl: process.env.DIRECT_URL, // Optional if needed
  },
  // studio: {
  //   port: 5555,
  // },
});
