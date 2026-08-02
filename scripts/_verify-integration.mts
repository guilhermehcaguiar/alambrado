import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const role = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !role) {
  console.log("ENV: INCOMPLETO");
  process.exit(1);
}

console.log("HOSTNAME:", new URL(url).hostname);

const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const adminClient = createClient(url, role, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1) anon: select disponiveis
const { data: anonSel, error: anonSelErr } = await anonClient
  .from("products")
  .select("*")
  .eq("available", true);
console.log("SELECT_ANON_OK:", !anonSelErr, "COUNT:", anonSel?.length ?? 0);
if (anonSelErr) console.log("SELECT_ANON_ERROR:", anonSelErr.code, anonSelErr.message);

// 2) anon: insert deve ser bloqueado por RLS
const { error: anonInsErr } = await anonClient.from("products").insert({
  name: "__verificacao_teste__",
  slug: "__verificacao_teste__",
  club: "Teste",
  season: "",
  category: "promocional-torcedor",
  description: "registro temporario de teste de RLS",
  price: 1,
  image_url: "",
  featured: false,
  available: false,
});
console.log("INSERT_ANON_BLOCKED:", Boolean(anonInsErr));
if (anonInsErr) console.log("INSERT_ANON_ERROR:", anonInsErr.code, anonInsErr.message);

// 3) admin: leitura direta
const { data: adminRows, error: adminErr } = await adminClient
  .from("products")
  .select("slug")
  .limit(1);
console.log("ADMIN_READ_OK:", !adminErr, "ROWS:", adminRows?.length ?? 0);
if (adminErr) console.log("ADMIN_READ_ERROR:", adminErr.code, adminErr.message);

// 4) bucket products
const { data: buckets, error: bucketsErr } = await adminClient.storage.listBuckets();
console.log("BUCKET_LIST_OK:", !bucketsErr);
if (bucketsErr) console.log("BUCKET_LIST_ERROR:", bucketsErr.message);
const productsBucket = (buckets ?? []).find((b) => b.id === "products");
console.log("BUCKET_PRODUCTS_EXISTS:", Boolean(productsBucket));
console.log("BUCKET_PRODUCTS_PUBLIC:", productsBucket?.public ?? false);

// 5) storage vazio
const { data: objs, error: objsErr } = await adminClient.storage
  .from("products")
  .list("", { limit: 100, offset: 0 });
console.log("OBJECT_LIST_OK:", !objsErr, "STORAGE_ITEMS:", objs?.length ?? 0);
if (objsErr) console.log("OBJECT_LIST_ERROR:", objsErr.message);

// 6) upload anon bloqueado (escrita publica)
const anonUpload = await anonClient.storage
  .from("products")
  .upload("__verificacao_anon__.txt", new Uint8Array([1]), {
    contentType: "text/plain",
    upsert: false,
  });
console.log("UPLOAD_ANON_BLOCKED:", Boolean(anonUpload.error));
if (anonUpload.error) console.log("UPLOAD_ANON_ERROR:", anonUpload.error.message);

// 7) teste controlado admin + limpeza
const tempPath = "__verificacao_temp__.txt";
const adminUpload = await adminClient.storage
  .from("products")
  .upload(tempPath, new Uint8Array([65, 76, 65]), {
    contentType: "text/plain",
    upsert: false,
  });
console.log("UPLOAD_ADMIN_OK:", !adminUpload.error);
if (adminUpload.error) console.log("UPLOAD_ADMIN_ERROR:", adminUpload.error.message);

if (!adminUpload.error) {
  const { data: pub, error: pubErr } = await adminClient.storage
    .from("products")
    .download(tempPath);
  console.log("PUBLIC_DOWNLOAD_OK:", !pubErr, "BYTES:", pub?.size ?? 0);
  if (pubErr) console.log("PUBLIC_DOWNLOAD_ERROR:", pubErr.message);
}

const cleanup = await adminClient.storage.from("products").remove([tempPath]);
console.log("CLEANUP_TEMP_OK:", !cleanup.error);
if (cleanup.error) console.log("CLEANUP_ERROR:", cleanup.error.message);

const { data: after } = await adminClient.storage
  .from("products")
  .list("", { limit: 100, offset: 0 });
console.log("STORAGE_ITEMS_AFTER_CLEANUP:", after?.length ?? 0);

process.exit(0);
