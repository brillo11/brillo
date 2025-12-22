import { defineConfig } from "@prisma/config";
import fs from "fs";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath) && process.loadEnvFile) {
  process.loadEnvFile(envPath);
}

export default defineConfig({
  datasource: {
    url: process.env.LONGFORM_DATABASE_URL!,
  }
});
