import { createClient } from "@supabase/supabase-js";

let browserAgnosticClient;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export function getSupabase() {
  if (!browserAgnosticClient) {
    browserAgnosticClient = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }

  return browserAgnosticClient;
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabase();
      const value = client[prop];

      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
