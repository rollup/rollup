---
title: Running Rollup in a Browser
---

# {{ $frontmatter.title }}

[[toc]]

## The browser build

While the regular Rollup build relies on some NodeJS builtin libraries, there is also a browser build available that only uses browser APIs. You can install it via

```shell
npm install @rollup/browser
```

and in your script, import it via

```js
import { rollup } from '@rollup/browser';
```

Alternatively, you can import from a CDN, e.g. for the ESM build

```js
import * as rollup from 'https://unpkg.com/@rollup/browser/dist/es/rollup.browser.js';
```

and for the UMD build

```html
<script src="https://unpkg.com/@rollup/browser/dist/rollup.browser.js"></script>
```

which will create a global variable `window.rollup`. Note that in each case, you need to make sure that the file `dist/bindings_wasm_bg.wasm` from the `@rollup/browser` package is served next to where the browser build is served.

As the browser build cannot access the file system, you either need to provide an [in-memory file system](#using-an-in-memory-file-system) via the [`fs`](../configuration-options/index.md#fs) option, or you need to [provide plugins](#using-plugins-to-resolve-and-load-modules) that resolve and load all modules you want to bundle.

## Using an in-memory file system

Rollup allows you to provide an in-memory file system implementation that needs to implement at least a certain sub-set of the NodeJS `fs` API, cf. the [`fs`](../configuration-options/index.md#fs) option. This makes the browser build behave very similar to the NodeJS build and even allows you to use certain plugins that rely on the file system, provided they only access it via the [`this.fs`](../plugin-development/index.md#this-fs) plugin context property. Here is an example that uses [`memfs`](https://www.npmjs.com/package/memfs):

```js twoslash
/** @type {import('rollup')} */
var rollup;
// ---cut---
import { rollup } from '@rollup/browser';
import { Volume } from 'memfs';

const vol = Volume.fromJSON({
	'/main.js': "import foo from 'foo.js'; console.log(foo);",
	'/foo.js': 'export default 42;'
});

rollup
	.rollup({
		input: '/main.js',
		fs: vol.promises
	})
	.then(bundle => bundle.generate({ format: 'es' }))
	.then(({ output }) => console.log(output[0].code));
```

## Using plugins to resolve and load modules

You can also resolve and load all modules via plugins. Here is how you could do this:

```js twoslash
/** @type {import('rollup')} */
var rollup;
// ---cut---
const modules = {
	'main.js': "import foo from 'foo.js'; console.log(foo);",
	'foo.js': 'export default 42;'
};

rollup
	.rollup({
		input: 'main.js',
		plugins: [
			{
				name: 'loader',
				resolveId(source) {
					if (modules.hasOwnProperty(source)) {
						return source;
					}
				},
				load(id) {
					if (modules.hasOwnProperty(id)) {
						return modules[id];
					}
				}
			}
		]
	})
	.then(bundle => bundle.generate({ format: 'es' }))
	.then(({ output }) => console.log(output[0].code));
```

This example only supports two imports, `"main.js"` and `"foo.js"`, and no relative imports. Here is another example that uses absolute URLs as entry points and supports relative imports. In that case, we are just re-bundling Rollup itself, but it could be used on any other URL that exposes an ES module:

```js twoslash
/** @type {import('rollup')} */
var rollup;
// ---cut---
rollup
	.rollup({
		input: 'https://unpkg.com/rollup/dist/es/rollup.js',
		plugins: [
			{
				name: 'url-resolver',
				resolveId(source, importer) {
					if (source[0] !== '.') {
						try {
							new URL(source);
							// If it is a valid URL, return it
							return source;
						} catch {
							// Otherwise make it external
							return { id: source, external: true };
						}
					}
					return new URL(source, importer).href;
				},
				async load(id) {
					const response = await fetch(id);
					return response.text();
				}
			}
		]
	})
	.then(bundle => bundle.generate({ format: 'es' }))
	.then(({ output }) => console.log(output));
```
