---
title: ES Module Syntax
---

# {{ $frontmatter.title }}

[[toc]]

The following is intended as a lightweight reference for the module behaviors defined in the [ES2015 specification](https://www.ecma-international.org/ecma-262/6.0/), since a proper understanding of the import and export statements are essential to the successful use of Rollup.

## Importing

Imported values cannot be reassigned, though imported objects and arrays _can_ be mutated (and the exporting module, and any other importers, will be affected by the mutation). In that way, they behave similarly to `const` declarations.

### Named Imports

Import a specific item from a source module, with its original name.

```js
import { something } from './module.js';
```

Import a specific item from a source module, with a custom name assigned upon import.

```js
import { something as somethingElse } from './module.js';
```

### Namespace Imports

Import everything from the source module as an object which exposes all the source module's named exports as properties and methods.

```js
import * as module from './module.js';
```

The `something` example from above would then be attached to the imported object as a property, e.g. `module.something`. If present, the default export can be accessed via `module.default`.

### Default Import

Import the **default export** of the source module.

```js
import something from './module.js';
```

### Empty Import

Load the module code, but don't make any new objects available.

```js
import './module.js';
```

This is useful for polyfills, or when the primary purpose of the imported code is to muck about with prototypes.

### Dynamic Import

Import modules using the [dynamic import API](https://github.com/tc39/proposal-dynamic-import#import).

```js
import('./modules.js').then(({ default: DefaultExport, NamedExport }) => {
	// do something with modules.
});
```

This is useful for code-splitting applications and using modules on-the-fly.

### Source Phase Import

Import the Source Phase representation of a module without executing it, using the [Source Phase Imports Proposal](https://github.com/tc39/proposal-source-phase-imports).

This is useful for importing compiled WebAssembly modules through the module system without relying on the fetch API:

```js
import source myModule from './module.wasm';
```

Source phase imports must be [external](../configuration-options/index.md#external) — Rollup will raise an error if a source phase import resolves to a non-external module. They are preserved as `import source` declarations in `es` output format. Other output formats (`cjs`, `amd`, `iife`, `umd`, `system`) do not support source phase imports and will raise an error if one is present.

## Exporting

### Named exports

Export a value that has been previously declared:

```js
const something = true;
export { something };
```

Rename on export:

```js
export { something as somethingElse };
```

Export a value immediately upon declaration:

```js
// this works with `var`, `let`, `const`, `class`, and `function`
export const something = true;
```

### Default Export

Export a single value as the source module's default export:

```js
export default something;
```

This practice is only recommended if your source module only has one export.

It is bad practice to mix default and named exports in the same module, though it is allowed by the specification.

## How bindings work

ES modules export _live bindings_, not values, so values can be changed after they are initially imported as per [this demo](../repl/index.md?shareable=JTdCJTIyZXhhbXBsZSUyMiUzQW51bGwlMkMlMjJtb2R1bGVzJTIyJTNBJTVCJTdCJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCU3QiUyMGNvdW50JTJDJTIwaW5jcmVtZW50JTIwJTdEJTIwZnJvbSUyMCcuJTJGaW5jcmVtZW50ZXIuanMnJTNCJTVDbiU1Q25jb25zb2xlLmxvZyhjb3VudCklM0IlMjAlMkYlMkYlMjAwJTVDbmluY3JlbWVudCgpJTNCJTVDbmNvbnNvbGUubG9nKGNvdW50KSUzQiUyMCUyRiUyRiUyMDElMjIlMkMlMjJpc0VudHJ5JTIyJTNBdHJ1ZSUyQyUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTdEJTJDJTdCJTIyY29kZSUyMiUzQSUyMmV4cG9ydCUyMGxldCUyMGNvdW50JTIwJTNEJTIwMCUzQiU1Q24lNUNuZXhwb3J0JTIwZnVuY3Rpb24lMjBpbmNyZW1lbnQoKSUyMCU3QiU1Q24lMjAlMjBjb3VudCUyMCUyQiUzRCUyMDElM0IlNUNuJTdEJTIyJTJDJTIyaXNFbnRyeSUyMiUzQWZhbHNlJTJDJTIybmFtZSUyMiUzQSUyMmluY3JlbWVudGVyLmpzJTIyJTdEJTVEJTJDJTIyb3B0aW9ucyUyMiUzQSU3QiUyMmFtZCUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyJTIyJTdEJTJDJTIyZm9ybWF0JTIyJTNBJTIyZXMlMjIlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTJDJTIybmFtZSUyMiUzQSUyMm15QnVuZGxlJTIyJTdEJTdE):

```js
// incrementer.js
export let count = 0;

export function increment() {
	count += 1;
}
```

```js
// main.js
import { count, increment } from './incrementer.js';

console.log(count); // 0
increment();
console.log(count); // 1

count += 1; // Error — only incrementer.js can change this
```
