---
name: generate-repl-links
description: Generate shareable rollupjs.org REPL links to reproduce specific Rollup inputs, options and outputs, e.g. to demonstrate an issue in a review or PR comment. Use when asked to create a REPL link.
---

# Generating Rollup REPL links

Base URL: `https://rollupjs.org/repl/`. The state lives entirely in the query string. The REPL code is in `docs/repl/` (parsing/serialization: `docs/repl/helpers/query.ts`).

## URL structure

```
https://rollupjs.org/repl/?<engine-modifier>&shareable=<payload>
```

- `shareable` (required): the encoded state, see below.
- Engine modifier (optional, one of):
  - `version=<x.y.z[-n]>` — run a released Rollup version from unpkg (no `v` prefix).
  - `pr=<digits>` — run the build published for a GitHub PR. Requires a maintainer to add the "x⁸ ⚙️ build repl artefacts" label; otherwise the artifacts are missing and the REPL fails to load. `pr` wins over `version`.

## The `shareable` payload

Base64url of `JSON.stringify({ example: null, modules, options })` (standard Base64 with `+` → `-`, `/` → `_`; padding optional). Generate with Node:

```js
const link = `https://rollupjs.org/repl/?shareable=${Buffer.from(
	JSON.stringify({ example: null, modules, options })
).toString('base64url')}`;
```

- `modules`: array of `{ code, isEntry, name }`. The first module (conventionally `main.js`) is always an entry and its name is fixed in the UI. Additional entries need `isEntry: true`.
- Module names are module IDs: a relative import must match another module's `name` exactly, including any directory prefix and extension (`.js` is appended as fallback on resolution).
- `options`: nested Rollup options object. Include only options that deviate from the defaults.
- When setting only non-output options (`treeshake`, `jsx`, `context`, …), the REPL misparses the link — always include at least one `output.*` option (e.g. `"output": { "format": "es" }`).

## Limitations

- No plugins, no `input`/`external`/`onwarn`/`cache`; unknown option keys are silently ignored.
- No explicit externals: every bare (non-relative) import is treated as external.
- Keep all state strings (module code, module names and option values) ASCII when using the Node examples: their UTF-8 encoding is incompatible with the REPL's byte-string decoder for non-ASCII characters.
- The full source is embedded in the URL (~33% larger than the code, no compression) — keep examples minimal.
- Invalid select-option values are replaced with defaults before reaching Rollup; other invalid values may surface as Rollup build errors. Only options supported by `docs/repl/stores/options.ts` can be reproduced.
- One module needs to be called `main.js`

## Example

```js
const link = `https://rollupjs.org/repl/?shareable=${Buffer.from(
	JSON.stringify({
		example: null,
		modules: [
			{
				code: "import { x } from './other.js';\nconsole.log(x);",
				isEntry: true,
				name: 'main.js'
			},
			{ code: 'export const x = 42;', isEntry: false, name: 'other.js' }
		],
		options: { output: { format: 'es' } }
	})
).toString('base64url')}`;
```

To demonstrate a PR's behavior, append the `pr` modifier: `https://rollupjs.org/repl/?pr=1234&shareable=...`.
