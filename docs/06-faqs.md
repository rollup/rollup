---
title: Frequently Asked Questions
---

#### Why are ES modules better than CommonJS Modules?

ES modules are an official standard and the clear path forward for JavaScript code structure, whereas CommonJS modules are an idiosyncratic legacy format that served as a stopgap solution before ES modules had been proposed. ES modules allow static analysis that helps with optimizations like tree-shaking and scope-hoisting, and provide advanced features like circular references and live bindings.

#### What Is "tree-shaking?"

Tree-shaking, also known as "live code inclusion", is Rollup's process of eliminating code that is not actually used in a given project. It is a [form of dead code elimination](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.jnypozs9n) but can be much more efficient than other approaches with regard to output size. The name is derived from the [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of the modules (not the module graph). The algorithm first marks all relevant statements and then "shakes the syntax tree" to remove all dead code. It is similar in idea to the [mark-and-sweep garbage collection algorithm](https://en.wikipedia.org/wiki/Tracing_garbage_collection). Even though this algorithm is not restricted to ES modules, they make it much more efficient as they allow Rollup to treat all modules together as a big abstract syntax tree with shared bindings.

#### How do I use Rollup in Node.js with CommonJS modules?

Rollup strives to implement the specification for ES modules, not necessarily the behaviors of Node.js, NPM, `require()`, and CommonJS. Consequently, loading of CommonJS modules and use of Node's module location resolution logic are both implemented as optional plugins, not included by default in the Rollup core. Just `npm install` the [commonjs](https://github.com/rollup/plugins/tree/master/packages/commonjs) and [node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve) plugins and then enable them using a `rollup.config.js` file and you should be all set. If the modules import JSON files, you will also need the [json](https://github.com/rollup/plugins/tree/master/packages/json) plugin.

#### Why isn't node-resolve a built-in feature?

There are two primary reasons:

1. Philosophically, it's because Rollup is essentially a [polyfill](https://en.wikipedia.org/wiki/Polyfill_(programming)) of sorts for native module loaders in both Node and browsers. In a browser, `import foo from 'foo'` won't work, because browsers don't use Node's resolution algorithm.

2. On a practical level, it's just much easier to develop software if these concerns are neatly separated with a good API. Rollup's core is quite large, and everything that stops it getting larger is a good thing. Meanwhile, it's easier to fix bugs and add features. By keeping Rollup lean, the potential for technical debt is small.

Please see [this issue](https://github.com/rollup/rollup/issues/1555#issuecomment-322862209) for a more verbose explanation.

#### Why do additional imports turn up in my entry chunks when code-splitting?

By default when creating multiple chunks, imports of dependencies of entry chunks will be added as empty imports to the entry chunks themselves. [Example](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMHZhbHVlJTIwZnJvbSUyMCcuJTJGb3RoZXItZW50cnkuanMnJTNCJTVDbmNvbnNvbGUubG9nKHZhbHVlKSUzQiUyMiUyQyUyMmlzRW50cnklMjIlM0F0cnVlJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMm90aGVyLWVudHJ5LmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMGV4dGVybmFsVmFsdWUlMjBmcm9tJTIwJ2V4dGVybmFsJyUzQiU1Q25leHBvcnQlMjBkZWZhdWx0JTIwMiUyMColMjBleHRlcm5hbFZhbHVlJTNCJTIyJTJDJTIyaXNFbnRyeSUyMiUzQXRydWUlN0QlNUQlMkMlMjJvcHRpb25zJTIyJTNBJTdCJTIyZm9ybWF0JTIyJTNBJTIyZXNtJTIyJTJDJTIybmFtZSUyMiUzQSUyMm15QnVuZGxlJTIyJTJDJTIyYW1kJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjIlMjIlN0QlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTdEJTJDJTIyZXhhbXBsZSUyMiUzQW51bGwlN0Q=):

```js
// input
// main.js
import value from './other-entry.js';
console.log(value);

// other-entry.js
import externalValue from 'external';
export default 2 * externalValue;

// output
// main.js
import 'external'; // this import has been hoisted from other-entry.js
import value from './other-entry.js';
console.log(value);

// other-entry.js
import externalValue from 'external';
var value = 2 * externalValue;
export default value;
```

This does not affect code execution order or behaviour, but it will speed up how your code is loaded and parsed. Without this optimization, a JavaScript engine needs to perform the following steps to run `main.js`:
1. Load and parse `main.js`. At the end, an import to `other-entry.js` will be discovered.
2. Load and parse `other-entry.js`. At the end, an import to `external` will be discovered.
3. Load and parse `external`.
4. Execute `main.js`.

With this optimization, a JavaScript engine will discover all transitive dependencies after parsing an entry module, avoiding the waterfall:
1. Load and parse `main.js`. At the end, imports to `other-entry.js` and `external` will be discovered.
2. Load and parse `other-entry.js` and `external`. The import of `other-entry.js` is already loaded and parsed.
3. Execute `main.js`.

There may be situations where this optimization is not desired, in which case you can turn it off via the [`output.hoistTransitiveImports`](guide/en/#outputhoisttransitiveimports) option. This optimization is also never applied when using the [`output.preserveModules`](guide/en/#outputpreservemodules) option.

#### How do I add polyfills to a Rollup bundle?

Even though Rollup will usually try to maintain exact module execution order when bundling, there are two situations when this is not always the case: code-splitting and external dependencies. The problem is most obvious with external dependencies, see the following [example](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCcuJTJGcG9seWZpbGwuanMnJTNCJTVDbmltcG9ydCUyMCdleHRlcm5hbCclM0IlNUNuY29uc29sZS5sb2coJ21haW4nKSUzQiUyMiUyQyUyMmlzRW50cnklMjIlM0F0cnVlJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMnBvbHlmaWxsLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmNvbnNvbGUubG9nKCdwb2x5ZmlsbCcpJTNCJTIyJTJDJTIyaXNFbnRyeSUyMiUzQWZhbHNlJTdEJTVEJTJDJTIyb3B0aW9ucyUyMiUzQSU3QiUyMmZvcm1hdCUyMiUzQSUyMmVzbSUyMiUyQyUyMm5hbWUlMjIlM0ElMjJteUJ1bmRsZSUyMiUyQyUyMmFtZCUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyJTIyJTdEJTJDJTIyZ2xvYmFscyUyMiUzQSU3QiU3RCU3RCUyQyUyMmV4YW1wbGUlMjIlM0FudWxsJTdE):

```js
// main.js
import './polyfill.js';
import 'external';
console.log('main');

// polyfill.js
console.log('polyfill');
```

Here the execution order is `polyfill.js` → `external` → `main.js`. Now when you bundle the code, you will get

```js
import 'external';
console.log('polyfill');
console.log('main');
```

with the execution order `external` → `polyfill.js` → `main.js`. This is not a problem caused by Rollup putting the `import` at the top of the bundle—imports are always executed first, no matter where they are located in the file. This problem can be solved by creating more chunks: If `dep.js` ends up in a different chunk than `main.js`, [correct execution order will be preserved](https://rollupjs.org/repl/?shareable=JTdCJTIybW9kdWxlcyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJtYWluLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmltcG9ydCUyMCcuJTJGcG9seWZpbGwuanMnJTNCJTVDbmltcG9ydCUyMCdleHRlcm5hbCclM0IlNUNuY29uc29sZS5sb2coJ21haW4nKSUzQiUyMiUyQyUyMmlzRW50cnklMjIlM0F0cnVlJTdEJTJDJTdCJTIybmFtZSUyMiUzQSUyMnBvbHlmaWxsLmpzJTIyJTJDJTIyY29kZSUyMiUzQSUyMmNvbnNvbGUubG9nKCdwb2x5ZmlsbCcpJTNCJTIyJTJDJTIyaXNFbnRyeSUyMiUzQXRydWUlN0QlNUQlMkMlMjJvcHRpb25zJTIyJTNBJTdCJTIyZm9ybWF0JTIyJTNBJTIyZXNtJTIyJTJDJTIybmFtZSUyMiUzQSUyMm15QnVuZGxlJTIyJTJDJTIyYW1kJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjIlMjIlN0QlMkMlMjJnbG9iYWxzJTIyJTNBJTdCJTdEJTdEJTJDJTIyZXhhbXBsZSUyMiUzQW51bGwlN0Q=). However there is not yet an automatic way to do this in Rollup. For code-splitting, the situation is similar as Rollup is trying to create as few chunks as possible while making sure no code is executed that is not needed.

For most code this is not a problem, because Rollup can guarantee:

> If module A imports module B and there are no circular imports, then B will always be executed before A.

This is however a problem for polyfills, as those usually need to be executed first but it is usually not desired to place an import of the polyfill in every single module. Luckily, this is not needed:

1. If there are no external dependencies that depend on the polyfill, it is enough to add an import of the polyfill as first statement to each static entry point.
2. Otherwise, additionally making the polyfill a separate entry or [manual chunk](guide/en/#outputmanualchunks) will always make sure it is executed first.

#### Is Rollup meant for building libraries or applications?

Rollup is already used by many major JavaScript libraries, and can also be used to build the vast majority of applications. However if you want to use code-splitting or dynamic imports with older browsers, you will need an additional runtime to handle loading missing chunks. We recommend using the [SystemJS Production Build](https://github.com/systemjs/systemjs#browser-production) as it integrates nicely with Rollup's system format output and is capable of properly handling all the ES module live bindings and re-export edge cases. Alternatively, an AMD loader can be used as well.

#### Who made the Rollup logo? It's lovely.

[Julian Lloyd](https://twitter.com/jlmakes)!
