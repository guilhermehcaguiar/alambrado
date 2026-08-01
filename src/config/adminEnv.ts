export type AdminSupabaseConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

export function isAdminSupabaseConfigured(): boolean {
  if (typeof window !== "undefined") {
    return false;
  }
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getAdminSupabaseConfig(): AdminSupabaseConfig {
  if (typeof window !== "undefined") {
    throw new Error("Configuração administrativa só pode ser usada em scripts locais.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Credenciais administrativas ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (Service Role é usada somente por scripts locais).",
    );
  }

  return { supabaseUrl, serviceRoleKey };
}
