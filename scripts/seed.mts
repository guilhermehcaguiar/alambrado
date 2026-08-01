import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const WEBP_EXT = /\.webp$/i;
const OTHER_IMAGE_EXT = /\.(jpg|jpeg|png)$/i;

type SeedProduct = {
  slug: string;
  name: string;
  club: string;
  season: string;
  price: number;
  description: string;
  featured: boolean;
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "real-madrid-home",
    name: "Real Madrid Home",
    club: "Real Madrid",
    season: "2025/26",
    price: 119.9,
    featured: true,
    description:
      "Camisa Real Madrid versão Torcedor. Tecido leve e respirável com caimento fiel ao modelo original.",
  },
  {
    slug: "barcelona-home",
    name: "Barcelona Home",
    club: "Barcelona",
    season: "2025/26",
    price: 119.9,
    featured: false,
    description:
      "Camisa Barcelona versão Torcedor. Cores vibrantes e acabamento premium para o dia a dia e o estádio.",
  },
  {
    slug: "city-home",
    name: "Manchester City Home",
    club: "Manchester City",
    season: "2025/26",
    price: 119.9,
    featured: false,
    description:
      "Camisa Manchester City versão Torcedor. Conforto, leveza e visual fiel ao modelo oficial.",
  },
  {
    slug: "arsenal-home",
    name: "Arsenal Home",
    club: "Arsenal",
    season: "2025/26",
    price: 119.9,
    featured: true,
    description:
      "Camisa Arsenal versão Torcedor. Tradição e qualidade com acabamento premium.",
  },
];

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ${name} é obrigatória para o seed.`);
  }
  return value;
}

async function main(): Promise<void> {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const bucket = "products";
  const folder = "promocional-torcedor";
  const imagesDir = path.resolve(process.cwd(), "catalogo", folder);

  const allFiles = await readdir(imagesDir);
  const webpFiles = allFiles.filter((file) => WEBP_EXT.test(file));
  const invalidFiles = allFiles.filter((file) => OTHER_IMAGE_EXT.test(file));

  if (invalidFiles.length > 0) {
    throw new Error(
      `O seed aceita somente imagens WebP. Formatos inválidos encontrados: ${invalidFiles.join(", ")}`,
    );
  }

  if (webpFiles.length === 0) {
    throw new Error(
      `Nenhuma imagem WebP encontrada em ${imagesDir}. Adicione as fotos reais dos produtos em .webp antes de executar o seed.`,
    );
  }

  const uploaded = new Map<string, string>();
  for (const file of webpFiles) {
    const storagePath = `${folder}/${file}`;
    const buffer = await readFile(path.join(imagesDir, file));
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, { upsert: true });

    if (error) {
      console.error(`Falha no upload de ${storagePath}:`, error.message);
      continue;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    uploaded.set(file, data.publicUrl);
  }

  const rows = PRODUCTS.map((product) => {
    const file = `${product.slug}.webp`;
    return {
      name: product.name,
      slug: product.slug,
      club: product.club,
      season: product.season,
      category: "promocional-torcedor",
      description: product.description,
      price: product.price,
      image_url: uploaded.get(file) ?? "",
      featured: product.featured,
      available: true,
    };
  });

  const { error: insertError } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" });

  if (insertError) {
    throw new Error(`Falha ao inserir produtos: ${insertError.message}`);
  }

  console.log(`Seed concluído: ${rows.length} produtos, ${uploaded.size} imagens.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
