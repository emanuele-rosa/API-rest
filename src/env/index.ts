import { config } from "dotenv";
import { z } from "zod";

process.env.NODE_ENV === "test" ? config({ path: ".env.test" }) : config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Environment variable validation error", _env.error.format());

  throw new Error("Environment variable validation error");
}

export const env = _env.data;
