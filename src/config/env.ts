import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  VENICE_API_KEY: z.string().default("replace-me"),
  VENICE_PROFILE_ID: z.string().default("h4ck3r"),
  DATABASE_URL: z.string().default("postgres://base44:password@localhost:5432/base44"),
  AWS_REGION: z.string().optional(),
  ID_BUCKET: z.string().optional(),
  JWT_SECRET: z.string().default("insecure-development-secret-change-me"),
  STRIPE_WEBHOOK_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);
