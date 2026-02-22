import { defineConfig } from "@prisma/config";
import fs from "fs";
import path from "path";

import dotenv from "dotenv";

// Since we know we are in packages/database, the root .env is at ../../.env
const envPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
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
