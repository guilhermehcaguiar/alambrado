# ALAMBRADO — WEAR THE GAME

Catálogo de camisas de futebol tailandesas 1:1 com carrinho e checkout pelo WhatsApp. Next.js (App Router) + TypeScript + Tailwind + Supabase (Database e Storage), hospedado na Vercel Hobby.

## Comandos

```bash
npm run dev          # desenvolvimento
npm run lint         # ESLint
npm run type-check   # verificação de tipos
npm run build        # build de produção
```

## Automação do catálogo

Imagens WebP em `catalogo/<categoria>/` + `catalogo.csv` = produtos e imagens no Supabase:

```bash
npm run catalog:validate    # valida tudo, sem acessar o Supabase
npm run catalog:dry-run     # mostra o que seria feito, sem alterar
npm run catalog:import      # envia imagens e cadastra/atualiza produtos
npm run catalog:import:overwrite  # importa substituindo imagens existentes
npm run catalog:delete -- --slug=<slug> --confirm  # exclui um produto
```

Documentação completa (local, não versionada): [`docs-ai/CATALOG_IMPORT.md`](docs-ai/CATALOG_IMPORT.md).

> Requisitos: Node.js 24+, Supabase configurado e Service Role somente em `.env` para importação/dry-run. A validação (`catalog:validate`) funciona sem credenciais.
