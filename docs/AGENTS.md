# docs/ - Website and REPL Rules

## Build Guard

- The website build runs in Vercel PR previews, not GitHub Actions — run `npm run build:docs` locally to catch docs/REPL breakage before pushing (`test:typescript` additionally type-checks docs)
- The dev REPL (`npm run dev`) imports Rollup live from `src/browser-entry.ts` with HMR — browser-unsafe changes in `src/` crash it; the production REPL loads published artifacts (unpkg/S3), and the docs build externalizes `/browser-entry`
- `build:docs` does NOT type-check; run `npx vue-tsc --noEmit -p docs` after TypeScript changes. Docs type-checking includes the whole `src/` tree, so `src/` type errors surface there

## Build-Time Verification (docs/.vitepress/verify-anchors.ts)

- Every `URL_*` constant in `src/utils/urls.ts` is verified against the built docs — renaming or removing a docs heading referenced from there breaks the build; keep `urls.ts` in sync with headings
- Inline markdown links must be one of: an in-page anchor (`#slug`), a cross-page relative link (`../page/index.md`, anchors verified against the target page), or an `https://` URL (accepted unverified; reference-style links escape the check entirely) — anything else fails the build
- Renaming headings on legacy-slug pages regenerates `docs/guide/en/slugs-and-pages-by-legacy-slugs.json`: the build rewrites the file and then throws — commit the regenerated file. The mapping is keyed by heading title, so a renamed title also needs an entry in `docs/guide/en/legacy-slugs.json` or its redirect is lost
- Mermaid diagrams are pre-rendered to committed `.svg` files in `docs/.vitepress/graphs/`; a new mermaid block requires running `build:docs` locally and committing the SVG

## CLI Documentation

- `cli/help.md` is hand-written (at build time only `//region` markers are stripped and `__VERSION__` replaced); the docs page includes it via `<<< ../../cli/help.md#options{text}` — edit help.md once for both `--help` and the docs
- A new CLI option must stay in sync across up to 4 places: `commandAliases`, the warn-allow-list and the option mapping in `src/utils/options/mergeOptions.ts`, the help.md `#region options` block, and a hand-written docs section for CLI-only flags. `test:options` (CI) checks help.md against the docs CLI metadata (shortcuts, ordering, width), but nothing compares help.md to `mergeOptions` — that drift is invisible
