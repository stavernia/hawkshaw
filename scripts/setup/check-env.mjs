import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");
const examplePath = path.join(cwd, ".env.example");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local. Copy .env.example to .env.local first.");
  process.exit(1);
}

const envText = fs.readFileSync(envPath, "utf8");
const requiredKeys = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
];

const missing = requiredKeys.filter((key) => {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return true;
  const value = match[1]?.trim();
  return !value || value.includes("your-") || value.includes("example.supabase.co");
});

if (missing.length > 0) {
  console.error("Incomplete .env.local. Fill these keys with real values:");
  missing.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
}

if (fs.existsSync(examplePath)) {
  console.log("Found .env.example and .env.local.");
}

console.log("Environment looks ready for local Hawkshaw development.");

