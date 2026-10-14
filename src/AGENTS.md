# src/ - Core Architecture Rules

## Layering

- The build is phase-driven (`src/utils/buildPhase.ts`): `Graph.build()` runs LOAD_AND_PARSE → ANALYSE → GENERATE
- AST nodes reach their module only via `Module.astContext` (the `AstContext` interface) for errors, logging, variable inclusion, options and magicString — never import module internals from `ast/`

## Logging and Errors

- User-facing diagnostics are named `logXxx(): RollupLog` factories in `src/utils/logs.ts`, thrown via `error(log)` or reported via `onLog`/`this.warn` — never build ad-hoc log objects (plain `Error` throws are reserved for internal invariants)
- Error codes are uppercase string constants in one alphabetical block in `logs.ts`; insert new codes alphabetically and keep the `logXxx` functions sorted by code
- Never hard-code docs URLs in log messages — always reference a `URL_*` constant from `src/utils/urls.ts` (relative fragments only; the base URL is added by `getRollupUrl` in `src/utils/url.ts`) so the docs build can verify the link targets

## Plugin Hooks

- Each hook belongs to exactly one execution category, typed in `src/rollup/types.d.ts` (`FirstPluginHooks`/`SequentialPluginHooks`/`ParallelPluginHooks`, plus Sync vs Async). Adding a hook means adding it to `FunctionPluginHooks` AND the right category type
- Build hooks are invoked through `src/utils/PluginDriver.ts` methods (`hookFirst*`, `hookReduceArg0*`, `hookReduceValue*`, `hookParallel`, `hookSeq`) — the chosen method determines the hook's runtime semantics (`options` and `onLog` are invoked directly instead)
- Hook `filter` support must be registered in `HookFilterExtension` (types.d.ts) and the runHook switch in `PluginDriver.ts`

## Options

- Normalization (`normalizeInputOptions`/`normalizeOutputOptions`) must produce a full `Normalized*Options` object; options where later code must distinguish default from user value are recorded in `unsetOptions` (currently `entryFileNames`, `exports`, `sourcemapFileNames` in output normalization — they drive special behavior as well as the "you set X, did you mean Y" warnings)
- Preset-style options (`treeshake`, `generatedCode`, `jsx`) use the shared preset helpers in `src/utils/options/options.ts` — don't hand-roll preset resolution

## Tree-Shaking

- `ExpressionEntity` defaults are intentionally pessimistic (everything has effects, unknown values); new entities only override methods to be more precise — when in doubt, deoptimize instead of asserting
- Node contract: `bind()` runs once after scope population and resolves variables (plus call interactions); `hasEffects`/`include` do the analysis. Memoize repeated results via the `flags` bitfield (`isFlagSet`/`setFlag`); one-off state can be plain booleans
- Deoptimizations that can invalidate earlier inclusion decisions must ensure a new pass via `requestTreeshakingPass()` (drives the `Graph.includeStatements` loop)
- Entities that memoize decisions must register themselves with the variable they depend on and implement `deoptimizeCache()` — otherwise they read stale values after reassignment
- Generic child traversal uses the generated `childNodeKeys[this.type]` (as in `NodeBase`); nodes may still access specific named children directly
- Respect `context.brokenFlow` in effects/inclusion logic. Unknown node types fall back to `UnknownNode` via `getNodeConstructor` (aggressive deoptimization) — keep that fallback

## Codegen

- Nodes render by mutating the shared `MagicString` (cloned in `Module.render`), staying within their own `[start, end)` range or the boundaries passed via render options — statement renderers get extended comment/whitespace boundaries, and `MetaProperty` deliberately overwrites its parent
- Renaming identifiers during render uses `code.overwrite(..., { contentOnly: true, storeName: true })`: `storeName` records the original name for the sourcemap's `names` array, `contentOnly` limits the overwrite to the identifier's own range so adjacent appended/prepended content survives (see `Identifier.render`)
- `options.snippets` (from `getGenerateCodeSnippets`) is the shared source for syntax that depends on `compact`/`generatedCode` — use it instead of hand-rolling those choices

## Transform Chain

- In transform hook results, `map: null` means "no map" and is silently dropped; `map: undefined` with code present means "map missing" and is recorded to later trigger the "sourcemap likely incorrect" warning
- `setAssetSource` is forbidden inside transform hooks; when a transform hook uses the tracked plugin cache, the module is flagged `customTransformCache` internally and excluded from automatic module cache reuse

## Lifecycle Errors

- On build failure, `buildEnd(err)` runs first, then `closeBundle(err)` receives the error; if `buildEnd` itself throws, a compound error is passed to `closeBundle`. `catchUnfinishedHookActions` surfaces unresolved plugin promises so a bad exit never happens silently — preserve this ordering

## Watch Mode

- Watch reuses `rollupInternal` with non-null `registerWatchHooks` — never duplicate build logic in `src/watch/`
- Module invalidation (marking, nulling `originalCode`) is immediate; only the rebuild is coalesced: change events accumulate in `invalidatedIds`, and while a run is active a rerun is scheduled instead
- Each Task holds the `watchChange`/`closeWatcher` hooks of its latest Graph; a Graph hands them over at construction, replacing the previous ones. The Watcher calls them next to the `change`/`close` events. `onCurrentRun` is only for third parties
- Transform-dependency invalidation nulls `originalCode` on cached modules to force re-transform
