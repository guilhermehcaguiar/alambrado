import { createClient } from "@supabase/supabase-js";
import {
  getAdminSupabaseConfig,
  isAdminSupabaseConfigured,
} from "@/config/adminEnv";

const BUCKET = "products";

function log(tag: string, message: string): void {
  console.log(`[${tag}] ${message}`);
}

function redact(message: string, secret: string): string {
  if (!secret) {
    return message;
  }
  return message.split(secret).join("[REDACTED]");
}

function readSlugArg(argv: string[]): string | null {
  for (const arg of argv) {
    if (arg.startsWith("--slug=")) {
      const value = arg.slice("--slug=".length).trim();
      return value.length > 0 ? value : null;
    }
  }
  return null;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const slug = readSlugArg(argv);
  const confirmed = argv.includes("--confirm");

  if (!slug) {
    throw new Error(
      'Uso: npm run catalog:delete -- --slug=<slug> [--confirm]. O slug é obrigatório.',
    );
  }

  if (!isAdminSupabaseConfigured()) {
    throw new Error(
      "Credenciais do Supabase ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de executar esta operação.",
    );
  }

  const { supabaseUrl, serviceRoleKey } = getAdminSupabaseConfig();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: product, error: findError } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (findError) {
    throw new Error(`Falha ao buscar o produto: ${redact(findError.message, serviceRoleKey)}`);
  }

  if (!product) {
    throw new Error(`Produto não encontrado com slug "${slug}". Nada foi removido.`);
  }

  const storagePath = extractStoragePath(product.image_url ?? "");

  console.log("");
  console.log("Removeria:");
  console.log(`  Produto: ${product.name} (slug: ${slug})`);
  console.log(`  Categoria: ${product.category}`);
  console.log(`  Imagem: ${storagePath ?? "(nenhuma)"}`);
  console.log("");

  if (!confirmed) {
    console.log("Nada foi removido. Execute novamente adicionando --confirm para confirmar.");
    return;
  }

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("slug", slug);

  if (deleteError) {
    throw new Error(
      `Falha ao remover o produto: ${redact(deleteError.message, serviceRoleKey)}. A imagem não foi removida.`,
    );
  }
  log("OK", `Produto "${slug}" removido do banco.`);

  if (storagePath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);
    if (removeError) {
      log(
        "WARN",
        `Falha ao remover a imagem "${storagePath}" do Storage: ${redact(
          removeError.message,
          serviceRoleKey,
        )}. Remova manualmente (possível órfão).`,
      );
    } else {
      log("OK", `Imagem "${storagePath}" removida do Storage.`);
    }
  }
}

function extractStoragePath(imageUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }
  const rawPath = imageUrl.slice(index + marker.length);
  if (!rawPath) {
    return null;
  }
  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

main().catch((error: unknown) => {
  log("ERROR", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
