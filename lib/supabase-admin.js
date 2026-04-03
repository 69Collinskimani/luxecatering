import { createClient } from "@supabase/supabase-js";

let adminClient;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_KEY")
    );
  }

  return adminClient;
}

export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabaseAdmin();
      const value = client[prop];

      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
