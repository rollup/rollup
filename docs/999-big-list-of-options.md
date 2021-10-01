---
title: Big list of options
---

### Core functionality

#### external

Type: `(string | RegExp)[] | RegExp | string | (id: string, parentId: string, isResolved: boolean) => boolean`<br> CLI: `-e`/`--external <external-id,another-external-id,...>`

Either a function that takes an `id` and returns `true` (external) or `false` (not external), or an `Array` of module IDs, or regular expressions to match module IDs, that should remain external to the bundle. Can also be just a single ID or regular expression. The matched IDs should be either:

1. the name of an external dependency, exactly the way it is written in the import statement. I.e. to mark `import "dependency.js"` as external, use `"dependency.js"` while to mark `import "dependency"` as external, use `"dependency"`.
2. a resolved ID (like an absolute path to a file).

```js
// rollup.config.js
import path from 'path';

export default {
  ...,
  external: [
    'some-externally-required-library',
    path.resolve( __dirname, 'src/some-local-file-that-should-not-be-bundled.js' ),
    /node_modules/
  ]
};
```

Note that if you want to filter out package imports, e.g. `import {rollup} from 'rollup'`, via a `/node_modules/` regular expression, you need something like [@rollup/plugin-node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve) to resolve the imports to `node_modules` first.

When given as a command line argument, it should be a comma-separated list of IDs:

```bash
rollup -i src/main.js ... -e foo,bar,baz
```

When providing a function, it is called with three parameters `(id, parent, isResolved)` that can give you more fine-grained control:

- `id` is the id of the module in question
- `parent` is the id of the module doing the import
- `isResolved` signals whether the `id` has been resolved by e.g. plugins

When creating an `iife` or `umd` bundle, you will need to provide global variable names to replace your external imports via the `output.globals` option.

If a relative import, i.e. starting with `./` or `../`, is marked as "external", rollup will internally resolve the id to an absolute file system location so that different imports of the external module can be merged. When the resulting bundle is written, the import will again be converted to a relative import. Example:

```js
// input
// src/main.js (entry point)
import x from '../external.js';
import './nested/nested.js';
console.log(x);

// src/nested/nested.js
// the import would point to the same file if it existed
import x from '../../external.js';
console.log(x);

// output
// the different imports are merged
import x from '../external.js';

console.log(x);

console.log(x);
```

The conversion back to a relative import is done as if `output.file` or `output.dir` were in the same location as the entry point or the common base directory of all entry points if there is more than one.

#### input

Type: `string | string [] | { [entryName: string]: string }`<br> CLI: `-i`/`--input <filename>`

The bundle's entry point(s) (e.g. your `main.js` or `app.js` or `index.js`). If you provide an array of entry points or an object mapping names to entry points, they will be bundled to separate output chunks. Unless the [`output.file`](guide/en/#outputfile) option is used, generated chunk names will follow the [`output.entryFileNames`](guide/en/#outputentryfilenames) option. When using the object form, the `[name]` portion of the file name will be the name of the object property while for the array form, it will be the file name of the entry point.

Note that it is possible when using the object form to put entry points into different sub-folders by adding a `/` to the name. The following will generate at least two entry chunks with the names `entry-a.js` and `entry-b/index.js`, i.e. the file `index.js` is placed in the folder `entry-b`:

```js
// rollup.config.js
export default {
  ...,
  input: {
    a: 'src/main-a.js',
    'b/index': 'src/main-b.js'
  },
  output: {
    ...,
    entryFileNames: 'entry-[name].js'
  }
};
```

The option can be omitted if some plugin emits at least one chunk (using [`this.emitFile`](guide/en/#thisemitfile)) by the end of the [`buildStart`](guide/en/#buildstart) hook.

When using the command line interface, multiple inputs can be provided by using the option multiple times. When provided as the first options, it is equivalent to not prefix them with `--input`:

```sh
rollup --format es --input src/entry1.js --input src/entry2.js
# is equivalent to
rollup src/entry1.js src/entry2.js --format es
```

Chunks can be named by adding an `=` to the provided value:

```sh
rollup main=src/entry1.js other=src/entry2.js --format es
```

File names containing spaces can be specified by using quotes:

```sh
rollup "main entry"="src/entry 1.js" "src/other entry.js" --format es
```

#### output.dir

Type: `string`<br> CLI: `-d`/`--dir <dirname>`

The directory in which all generated chunks are placed. This option is required if more than one chunk is generated. Otherwise, the `file` option can be used instead.

#### output.file

Type: `string`<br> CLI: `-o`/`--file <filename>`

The file to write to. Will also be used to generate sourcemaps, if applicable. Can only be used if not more than one chunk is generated.

#### output.format

Type: `string`<br> CLI: `-f`/`--format <formatspecifier>`<br> Default: `"es"`

Specifies the format of the generated bundle. One of the following:

- `amd` – Asynchronous Module Definition, used with module loaders like RequireJS
- `cjs` – CommonJS, suitable for Node and other bundlers (alias: `commonjs`)
- `es` – Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a `<script type=module>` tag in modern browsers (alias: `esm`, `module`)
- `iife` – A self-executing function, suitable for inclusion as a `<script>` tag. (If you want to create a bundle for your application, you probably want to use this.). "iife" stands for "immediately-invoked [Function Expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)"
- `umd` – Universal Module Definition, works as `amd`, `cjs` and `iife` all in one
- `system` – Native format of the SystemJS loader (alias: `systemjs`)

#### output.globals

Type: `{ [id: string]: string } | ((id: string) => string)`<br> CLI: `-g`/`--globals <external-id:variableName,another-external-id:anotherVariableName,...>`

Specifies `id: variableName` pairs necessary for external imports in `umd`/`iife` bundles. For example, in a case like this…

```js
import $ from 'jquery';
```

…we want to tell Rollup that `jquery` is external and the `jquery` module ID equates to the global `$` variable:

```js
// rollup.config.js
export default {
  ...,
  external: ['jquery'],
  output: {
    format: 'iife',
    name: 'MyBundle',
    globals: {
      jquery: '$'
    }
  }
};

/*
var MyBundle = (function ($) {
  // code goes here
}($));
*/
```

Alternatively, supply a function that will turn an external module ID into a global variable name.

When given as a command line argument, it should be a comma-separated list of `id:variableName` pairs:

```
rollup -i src/main.js ... -g jquery:$,underscore:_
```

To tell Rollup that a local file should be replaced by a global variable, use an absolute id:

```js
// rollup.config.js
import path from 'path';
const externalId = path.resolve( __dirname, 'src/some-local-file-that-should-not-be-bundled.js' );

export default {
  ...,
  external: [externalId],
  output: {
    format: 'iife',
    name: 'MyBundle',
    globals: {
      [externalId]: 'globalVariable'
    }
  }
};
```

#### output.name

Type: `string`<br> CLI: `-n`/`--name <variableName>`

Necessary for `iife`/`umd` bundles that exports values in which case it is the global variable name representing your bundle. Other scripts on the same page can use this variable name to access the exports of your bundle.

```js
// rollup.config.js
export default {
  ...,
  output: {
    file: 'bundle.js',
    format: 'iife',
    name: 'MyBundle'
  }
};

// var MyBundle = (function () {...
```

Namespaces are supported i.e. your name can contain dots. The resulting bundle will contain the setup necessary for the namespacing.

```
rollup -n "a.b.c"

/* ->
this.a = this.a || {};
this.a.b = this.a.b || {};
this.a.b.c = ...
*/
```

#### output.plugins

Type: `OutputPlugin | (OutputPlugin | void)[]`

Adds a plugin just to this output. See [Using output plugins](guide/en/#using-output-plugins) for more information on how to use output-specific plugins and [Plugins](guide/en/#plugin-development) on how to write your own. For plugins imported from packages, remember to call the imported plugin function (i.e. `commonjs()`, not just `commonjs`). Falsy plugins will be ignored, which can be used to easily activate or deactivate plugins.

Not every plugin can be used here. `output.plugins` is limited to plugins that only use hooks that run during `bundle.generate()` or `bundle.write()`, i.e. after Rollup's main analysis is complete. If you are a plugin author, see [output generation hooks](guide/en/#output-generation-hooks) to find out which hooks can be used.

The following will add minification to one of the outputs:

```js
// rollup.config.js
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'main.js',
  output: [
    {
      file: 'bundle.js',
      format: 'es'
    },
    {
      file: 'bundle.min.js',
      format: 'es',
      plugins: [terser()]
    }
  ]
};
```

#### plugins

Type: `Plugin | (Plugin | void)[]`

See [Using plugins](guide/en/#using-plugins) for more information on how to use plugins and [Plugins](guide/en/#plugin-development) on how to write your own (try it out, it's not as difficult as it may sound and very much extends what you can do with Rollup). For plugins imported from packages, remember to call the imported plugin function (i.e. `commonjs()`, not just `commonjs`). Falsy plugins will be ignored, which can be used to easily activate or deactivate plugins.

```js
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const isProduction = process.env.NODE_ENV === 'production';

export default (async () => ({
  input: 'main.js',
  plugins: [resolve(), commonjs(), isProduction && (await import('rollup-plugin-terser')).terser()],
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
}))();
```

(This example also demonstrates how to use an async IIFE and dynamic imports to avoid unnecessary module loading, which can be surprisingly slow.)

### Advanced functionality

#### cache

Type: `RollupCache | false`

The `cache` property of a previous bundle. Use it to speed up subsequent builds in watch mode — Rollup will only reanalyse the modules that have changed. Setting this option explicitly to `false` will prevent generating the `cache` property on the bundle and also deactivate caching for plugins.

```js
const rollup = require('rollup');
let cache;

async function buildWithCache() {
  const bundle = await rollup.rollup({
    cache // is ignored if falsy
    // ... other input options
  });
  cache = bundle.cache; // store the cache object of the previous build
  return bundle;
}

buildWithCache()
  .then(bundle => {
    // ... do something with the bundle
  })
  .then(() => buildWithCache()) // will use the cache of the previous build
  .then(bundle => {
    // ... do something with the bundle
  });
```

#### makeAbsoluteExternalsRelative

Type: `boolean | "ifRelativeSource"`<br> CLI: `--makeAbsoluteExternalsRelative`/`--no-makeAbsoluteExternalsRelative`<br> Default: `true`

Determines if absolute external paths should be converted to relative paths in the output. This does not only apply to paths that are absolute in the source but also to paths that are resolved to an absolute path by either a plugin or Rollup core.

For `true`, an external import like `import "/Users/Rollup/project/relative.js"` would be converted to a relative path. When converting an absolute path to a relative path, Rollup does _not_ take the `file` or `dir` options into account, because those may not be present e.g. for builds using the JavaScript API. Instead, it assumes that the root of the generated bundle is located at the common shared parent directory of all modules that were included in the bundle. Assuming that the common parent directory of all modules is `"/Users/Rollup/project"`, the import from above would likely be converted to `import "./relative.js"` in the output. If the output chunk is itself nested in a sub-directory by choosing e.g. `chunkFileNames: "chunks/[name].js"`, the import would be `"../relative.js"`.

As stated before, this would also apply to originally relative imports like `import "./relative.js"` that are resolved to an absolute path before they are marked as external by the [`external`](guide/en/#external) option.

One common problem is that this mechanism will also apply to imports like `import "/absolute.js'"`, resulting in unexpected relative paths in the output.

For this case, choosing `"ifRelativeSource"` will check if the original import was a relative import and only then convert it to a relative import in the output. Choosing `false` will keep all paths as absolute paths in the output.

Note that when a relative path is directly marked as "external" using the [`external`](guide/en/#external) option, then it will be the same relative path in the output. When it is resolved first via a plugin or Rollup core and then marked as external, the above logic will apply.

#### maxParallelFileReads

Type: `number`<br> CLI: `--maxParallelFileReads <number>`<br> Default: 20

Limits the number of files rollup will open in parallel when reading modules. Without a limit or with a high enough value, builds can fail with an "EMFILE: too many open files". This dependes on how many open file handles the os allows.

#### onwarn

Type: `(warning: RollupWarning, defaultHandler: (warning: string | RollupWarning) => void) => void;`

A function that will intercept warning messages. If not supplied, warnings will be deduplicated and printed to the console. When using the [`--silent`](guide/en/#--silent) CLI option, this handler is the only way to get notified about warnings.

The function receives two arguments: the warning object and the default handler. Warnings objects have, at a minimum, a `code` and a `message` property, allowing you to control how different kinds of warnings are handled. Other properties are added depending on the type of warning.

```js
// rollup.config.js
export default {
  ...,
  onwarn (warning, warn) {
    // skip certain warnings
    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

    // throw on others
    if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

    // Use default for everything else
    warn(warning);
  }
};
```

Many warnings also have a `loc` property and a `frame` allowing you to locate the source of the warning:

```js
// rollup.config.js
export default {
  ...,
  onwarn ({ loc, frame, message }) {
    if (loc) {
      console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
      if (frame) console.warn(frame);
    } else {
      console.warn(message);
    }
  }
};
```

#### output.assetFileNames

Type: `string | ((assetInfo: AssetInfo) => string)`<br> CLI: `--assetFileNames <pattern>`<br> Default: `"assets/[name]-[hash][extname]"`

The pattern to use for naming custom emitted assets to include in the build output, or a function that is called per asset to return such a pattern. Patterns support the following placeholders:

- `[extname]`: The file extension of the asset including a leading dot, e.g. `.css`.
- `[ext]`: The file extension without a leading dot, e.g. `css`.
- `[hash]`: A hash based on the name and content of the asset.
- `[name]`: The file name of the asset excluding any extension.

Forward slashes `/` can be used to place files in sub-directories. When using a function, `assetInfo` is a reduced version of the one in [`generateBundle`](guide/en/#generatebundle) without the `fileName`. See also [`output.chunkFileNames`](guide/en/#outputchunkfilenames), [`output.entryFileNames`](guide/en/#outputentryfilenames).

#### output.banner/output.footer

Type: `string | (() => string | Promise<string>)`<br> CLI: `--banner`/`--footer <text>`

A string to prepend/append to the bundle. You can also supply a function that returns a `Promise` that resolves to a `string` to generate it asynchronously (Note: `banner` and `footer` options will not break sourcemaps).

```js
// rollup.config.js
export default {
  ...,
  output: {
    ...,
    banner: '/* my-library version ' + version + ' */',
    footer: '/* follow me on Twitter! @rich_harris */'
  }
};
```

See also [`output.intro/output.outro`](guide/en/#outputintrooutputoutro).

#### output.chunkFileNames

Type: `string | ((chunkInfo: ChunkInfo) => string)`<br> CLI: `--chunkFileNames <pattern>`<br> Default: `"[name]-[hash].js"`

The pattern to use for naming shared chunks created when code-splitting, or a function that is called per chunk to return such a pattern. Patterns support the following placeholders:

- `[format]`: The rendering format defined in the output options, e.g. `es` or `cjs`.
- `[hash]`: A hash based on the content of the chunk and the content of all its dependencies.
- `[name]`: The name of the chunk. This can be explicitly set via the [`output.manualChunks`](guide/en/#outputmanualchunks) option or when the chunk is created by a plugin via [`this.emitFile`](guide/en/#thisemitfile). Otherwise, it will be derived from the chunk contents.

Forward slashes `/` can be used to place files in sub-directories. When using a function, `chunkInfo` is a reduced version of the one in [`generateBundle`](guide/en/#generatebundle) without properties that depend on file names. See also [`output.assetFileNames`](guide/en/#outputassetfilenames), [`output.entryFileNames`](guide/en/#outputentryfilenames).

#### output.compact

Type: `boolean`<br> CLI: `--compact`/`--no-compact`<br> Default: `false`

This will minify the wrapper code generated by rollup. Note that this does not affect code written by the user. This option is useful when bundling pre-minified code.

#### output.entryFileNames

Type: `string | ((chunkInfo: ChunkInfo) => string)`<br> CLI: `--entryFileNames <pattern>`<br> Default: `"[name].js"`

The pattern to use for chunks created from entry points, or a function that is called per entry chunk to return such a pattern. Patterns support the following placeholders:

- `[format]`: The rendering format defined in the output options, e.g. `es` or `cjs`.
- `[hash]`: A hash based on the content of the entry point and the content of all its dependencies.
- `[name]`: The file name (without extension) of the entry point, unless the object form of input was used to define a different name.

Forward slashes `/` can be used to place files in sub-directories. When using a function, `chunkInfo` is a reduced version of the one in [`generateBundle`](guide/en/#generatebundle) without properties that depend on file names. See also [`output.assetFileNames`](guide/en/#outputassetfilenames), [`output.chunkFileNames`](guide/en/#outputchunkfilenames).

This pattern will also be used when setting the [`output.preserveModules`](guide/en/#outputpreservemodules) option. Here a different set of placeholders is available, though:

- `[format]`: The rendering format defined in the output options.
- `[name]`: The file name (without extension) of the file.
- `[ext]`: The extension of the file.
- `[extname]`: The extension of the file, prefixed by `.` if it is not empty.
- `[assetExtname]`: The extension of the file, prefixed by `.` if it is not empty and it is not one of `js`, `jsx`, `ts` or `tsx`.

#### output.extend

Type: `boolean`<br> CLI: `--extend`/`--no-extend`<br> Default: `false`

Whether to extend the global variable defined by the `name` option in `umd` or `iife` formats. When `true`, the global variable will be defined as `(global.name = global.name || {})`. When false, the global defined by `name` will be overwritten like `(global.name = {})`.

#### output.generatedCode

Type: `"es5" | "es2015" | { arrowFunctions?: boolean, constBindings?: boolean, objectShorthand?: boolean, preset?: "es5" | "es2015", reservedNamesAsProps?: boolean }`<br> CLI: `--generatedCode <preset>`<br> Default: `"es5"`

Which language features Rollup can safely use in generated code. This will not transpile any user code but only change the code Rollup uses in wrappers and helpers. You may choose one of several presets:

- `"es5"`: Do not use ES2015+ features like arrow functions, but do not quote reserved names used as props.
- `"es2015"`: Use any JavaScript features up to ES2015.

**output.generatedCode.arrowFunctions**<br> Type: `boolean`<br> CLI: `--generatedCode.arrowFunctions`/`--no-generatedCode.arrowFunctions`<br> Default: `false`

Whether to use arrow functions for auto-generated code snippets. Note that in certain places like module wrappers, Rollup will keep using regular functions wrapped in parentheses as in some JavaScript engines, these will provide [noticeably better performance](https://v8.dev/blog/preparser#pife).

**output.generatedCode.constBindings**<br> Type: `boolean`<br> CLI: `--generatedCode.constBindings`/`--no-generatedCode.constBindings`<br> Default: `false`

This will use `const` instead of `var` in certain places and helper functions. This will allow Rollup to generate more efficient helpers due to block scoping.

```js
// input
export * from 'external';

// cjs output with constBindings: false
var external = require('external');

Object.keys(external).forEach(function (k) {
  if (k !== 'default' && !exports.hasOwnProperty(k))
    Object.defineProperty(exports, k, {
      enumerable: true,
      get: function () {
        return external[k];
      }
    });
});

// cjs output with constBindings: true
const external = require('external');

for (const k in external) {
  if (k !== 'default' && !exports.hasOwnProperty(k))
    Object.defineProperty(exports, k, {
      enumerable: true,
      get: () => external[k]
    });
}
```

**output.generatedCode.objectShorthand**<br> Type: `boolean`<br> CLI: `--generatedCode.objectShorthand`/`--no-generatedCode.objectShorthand`<br> Default: `false`

Allows the use of shorthand notation in objects when the property name matches the value.

```javascript
// input
const foo = 1;
export { foo, foo as bar };

// system output with objectShorthand: false
System.register('bundle', [], function (exports) {
  'use strict';
  return {
    execute: function () {
      const foo = 1;
      exports({ foo: foo, bar: foo });
    }
  };
});

// system output with objectShorthand: true
System.register('bundle', [], function (exports) {
  'use strict';
  return {
    execute: function () {
      const foo = 1;
      exports({ foo, bar: foo });
    }
  };
});
```

**output.generatedCode.preset**<br> Type: `"es5" | "es2015"`<br> CLI: `--generatedCode <value>`

Allows choosing one of the presets listed above while overriding some options.

```js
export default {
  // ...
  output: {
    generatedCode: {
      preset: 'es2015',
      arrowFunctions: false
    }
    // ...
  }
};
```

**output.generatedCode.reservedNamesAsProps**<br> Type: `boolean`<br> CLI: `--generatedCode.reservedNamesAsProps`/`--no-generatedCode.reservedNamesAsProps`<br> Default: `false`

Determine whether reserved words like "default" can be used as prop names without using quotes. This will make the syntax of the generated code ES3 compliant. Note however that for full ES3 compliance, you may also need to polyfill some builtin functions like `Object.keys` or `Array.prototype.forEach`.

```javascript
// input
const foo = null;
export { foo as void };

// cjs output with reservedNamesAsProps: false
Object.defineProperty(exports, '__esModule', { value: true });

const foo = null;

exports['void'] = foo;

// cjs output with reservedNamesAsProps: true
Object.defineProperty(exports, '__esModule', { value: true });

const foo = null;

exports.void = foo;
```

#### output.hoistTransitiveImports

Type: `boolean`<br> CLI: `--hoistTransitiveImports`/`--no-hoistTransitiveImports`<br> Default: `true`

By default when creating multiple chunks, transitive imports of entry chunks will be added as empty imports to the entry chunks. See ["Why do additional imports turn up in my entry chunks when code-splitting?"](guide/en/#why-do-additional-imports-turn-up-in-my-entry-chunks-when-code-splitting) for details and background. Setting this option to `false` will disable this behaviour. This option is ignored when using the [`output.preserveModules`](guide/en/#outputpreservemodules) option as here, imports will never be hoisted.

#### output.inlineDynamicImports

Type: `boolean`<br> CLI: `--inlineDynamicImports`/`--no-inlineDynamicImports` Default: `false`

This will inline dynamic imports instead of creating new chunks to create a single bundle. Only possible if a single input is provided. Note that this will change the execution order: A module that is only imported dynamically will be executed immediately if the dynamic import is inlined.

#### output.interop

Type: `"auto" | "esModule" | "default" | "defaultOnly" | boolean | ((id: string) => "auto" | "esModule" | "default" | "defaultOnly" | boolean)`<br> CLI: `--interop <value>`<br> Default: `true`

Controls how Rollup handles default, namespace and dynamic imports from external dependencies in formats like CommonJS that do not natively support these concepts. Note that even though `true` is the current default value, this value is deprecated and will be replaced by `"auto"` in the next major version of Rollup. In the examples, we will be using the CommonJS format, but the interop similarly applies to AMD, IIFE and UMD targets as well.

To understand the different values, assume we are bundling the following code for a `cjs` target:

```js
import ext_default, * as external from 'external1';
console.log(ext_default, external.bar, external);
import('external2').then(console.log);
```

Keep in mind that for Rollup, `import * as ext_namespace from 'external'; console.log(ext_namespace.bar);` is completely equivalent to `import {bar} from 'external'; console.log(bar);` and will produce the same code. In the example above however, the namespace object itself is passed to a global function as well, which means we need it as a properly formed object.

- `"esModule"` assumes that required modules are transpiled ES modules where the required value corresponds to the module namespace, and the default export is the `.default` property of the exported object:

  ```js
  var external = require('external1');
  console.log(external['default'], external.bar, external);
  Promise.resolve()
    .then(function () {
      return require('external2');
    })
    .then(console.log);
  ```

  When `esModule` is used, Rollup adds no additional interop helpers and also supports live-bindings for default exports.

- `"default"` assumes that the required value should be treated as the default export of the imported module, just like when importing CommonJS from an ES module context in Node. In contrast to Node, though, named imports are supported as well which are treated as properties of the default import. To create the namespace object, Rollup injects helpers:

  ```js
  var external = require('external1');

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(
            n,
            k,
            d.get
              ? d
              : {
                  enumerable: true,
                  get: function () {
                    return e[k];
                  }
                }
          );
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var external__namespace = /*#__PURE__*/ _interopNamespaceDefault(external);
  console.log(external, external.bar, external__namespace);
  Promise.resolve()
    .then(function () {
      return /*#__PURE__*/ _interopNamespaceDefault(require('external2'));
    })
    .then(console.log);
  ```

- `"auto"` combines both `"esModule"` and `"default"` by injecting helpers that contain code that detects at runtime if the required value contains the [`__esModule` property](guide/en/#outputesmodule). Adding this property is a standard implemented by Rollup, Babel and many other tools to signify that the required value is the namespace of a transpiled ES module:

  ```js
  var external = require('external1');

  function _interopNamespace(e) {
    if (e && e.__esModule) {
      return e;
    } else {
      var n = Object.create(null);
      if (e) {
        Object.keys(e).forEach(function (k) {
          if (k !== 'default') {
            var d = Object.getOwnPropertyDescriptor(e, k);
            Object.defineProperty(
              n,
              k,
              d.get
                ? d
                : {
                    enumerable: true,
                    get: function () {
                      return e[k];
                    }
                  }
            );
          }
        });
      }
      n['default'] = e;
      return Object.freeze(n);
    }
  }

  var external__namespace = /*#__PURE__*/ _interopNamespace(external);
  console.log(external__namespace['default'], external.bar, external__namespace);
  Promise.resolve()
    .then(function () {
      return /*#__PURE__*/ _interopNamespace(require('external2'));
    })
    .then(console.log);
  ```

  Note how Rollup is reusing the created namespace object to get the `default` export. If the namespace object is not needed, Rollup will use a simpler helper:

  ```js
  // input
  import ext_default from 'external';
  console.log(ext_default);

  // output
  var ext_default = require('external');

  function _interopDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }

  var ext_default__default = /*#__PURE__*/ _interopDefault(ext_default);
  console.log(ext_default__default['default']);
  ```

- `"defaultOnly"` is similar to `"default"` except for the following:

  - Named imports are forbidden. If such an import is encountered, Rollup throws an error even in `es` and `system` formats. That way it is ensures that the `es` version of the code is able to import non-builtin CommonJS modules in Node correctly.
  - While namespace reexports `export * from 'external';` are not prohibited, they are ignored and will cause Rollup to display a warning because they would not have an effect if there are no named exports.
  - When a namespace object is generated, Rollup uses a much simpler helper.

  Here is what Rollup will create from the example code. Note that we removed `external.bar` from the code as otherwise, Rollup would have thrown an error because, as stated before, this is equivalent to a named import.

  ```js
  var ext_default = require('external1');

  function _interopNamespaceDefaultOnly(e) {
    return Object.freeze({ __proto__: null, default: e });
  }

  var ext_default__namespace = /*#__PURE__*/ _interopNamespaceDefaultOnly(ext_default);
  console.log(ext_default, ext_default__namespace);
  Promise.resolve()
    .then(function () {
      return /*#__PURE__*/ _interopNamespaceDefaultOnly(require('external2'));
    })
    .then(console.log);
  ```

- When a function is supplied, Rollup will pass each external id to this function once to control the interop type per dependency.

  As an example if all dependencies are CommonJs, the following config will ensure that named imports are only permitted from Node builtins:

  ```js
  // rollup.config.js
  import builtins from 'builtins';
  const nodeBuiltins = new Set(builtins());

  export default {
    // ...
    output: {
      // ...
      interop(id) {
        if (nodeBuiltins.has(id)) {
          return 'default';
        }
        return 'defaultOnly';
      }
    }
  };
  ```

- `true` is equivalent to `"auto"` except that it uses a slightly different helper for the default export that checks for the presence of a `default` property instead of the `__esModule` property.

  ☢️ _This value is deprecated and will be removed in a future Rollup version._

- `false` is equivalent to using `default` when importing a default export and `esModule` when importing a namespace.

  ☢️ _This value is deprecated and will be removed in a future Rollup version._

There are some additional options that have an effect on the generated interop code:

- Setting [`output.externalLiveBindings`](guide/en/#outputexternallivebindings) to `false` will generate simplified namespace helpers as well as simplified code for extracted default imports.
- Setting [`output.freeze`](guide/en/#outputfreeze) to `false` will prevent generated interop namespace objects from being frozen.

#### output.intro/output.outro

Type: `string | (() => string | Promise<string>)`<br> CLI: `--intro`/`--outro <text>`

Similar to [`output.banner/output.footer`](guide/en/#outputbanneroutputfooter), except that the code goes _inside_ any format-specific wrapper.

```js
export default {
  ...,
  output: {
    ...,
    intro: 'const ENVIRONMENT = "production";'
  }
};
```

#### output.manualChunks

Type: `{ [chunkAlias: string]: string[] } | ((id: string, {getModuleInfo, getModuleIds}) => string | void)`

Allows the creation of custom shared common chunks. When using the object form, each property represents a chunk that contains the listed modules and all their dependencies if they are part of the module graph unless they are already in another manual chunk. The name of the chunk will be determined by the property key.

Note that it is not necessary for the listed modules themselves to be part of the module graph, which is useful if you are working with `@rollup/plugin-node-resolve` and use deep imports from packages. For instance

```
manualChunks: {
  lodash: ['lodash']
}
```

will put all lodash modules into a manual chunk even if you are only using imports of the form `import get from 'lodash/get'`.

When using the function form, each resolved module id will be passed to the function. If a string is returned, the module and all its dependency will be added to the manual chunk with the given name. For instance this will create a `vendor` chunk containing all dependencies inside `node_modules`:

```javascript
manualChunks(id) {
  if (id.includes('node_modules')) {
    return 'vendor';
  }
}
```

Be aware that manual chunks can change the behaviour of the application if side effects are triggered before the corresponding modules are actually used.

When using the function form, `manualChunks` will be passed an object as second parameter containing the functions `getModuleInfo` and `getModuleIds` that work the same way as [`this.getModuleInfo`](guide/en/#thisgetmoduleinfo) and [`this.getModuleIds`](guide/en/#thisgetmoduleids) on the plugin context.

This can be used to dynamically determine into which manual chunk a module should be placed depending on its position in the module graph. For instance consider a scenario where you have a set of components, each of which dynamically imports a set of translated strings, i.e.

```js
// Inside the "foo" component

function getTranslatedStrings(currentLanguage) {
  switch (currentLanguage) {
    case 'en':
      return import('./foo.strings.en.js');
    case 'de':
      return import('./foo.strings.de.js');
    // ...
  }
}
```

If a lot of such components are used together, this will result in a lot of dynamic imports of very small chunks: Even though we known that all language files of the same language that are imported by the same chunk will always be used together, Rollup does not have this information.

The following code will merge all files of the same language that are only used by a single entry point:

```js
manualChunks(id, { getModuleInfo }) {
  const match = /.*\.strings\.(\w+)\.js/.exec(id);
  if (match) {
    const language = match[1]; // e.g. "en"
    const dependentEntryPoints = [];

    // we use a Set here so we handle each module at most once. This
    // prevents infinite loops in case of circular dependencies
    const idsToHandle = new Set(getModuleInfo(id).dynamicImporters);

    for (const moduleId of idsToHandle) {
      const { isEntry, dynamicImporters, importers } = getModuleInfo(moduleId);
      if (isEntry || dynamicImporters.length > 0) dependentEntryPoints.push(moduleId);

      // The Set iterator is intelligent enough to iterate over elements that
      // are added during iteration
      for (const importerId of importers) idsToHandle.add(importerId);
    }

    // If there is a unique entry, we put it into into a chunk based on the entry name
    if (dependentEntryPoints.length === 1) {
      return `${dependentEntryPoints[0].split('/').slice(-1)[0].split('.')[0]}.strings.${language}`;
    }
    // For multiple entries, we put it into a "shared" chunk
    if (dependentEntryPoints.length > 1) {
      return `shared.strings.${language}`;
    }
  }
}
```

#### output.minifyInternalExports

Type: `boolean`<br> CLI: `--minifyInternalExports`/`--no-minifyInternalExports`<br> Default: `true` for formats `es` and `system` or if `output.compact` is `true`, `false` otherwise

By default for formats `es` and `system` or if `output.compact` is `true`, Rollup will try to export internal variables as single letter variables to allow for better minification.

**Example**<br> Input:

```js
// main.js
import './lib.js';

// lib.js
import('./dynamic.js');
export const value = 42;

// dynamic.js
import { value } from './lib.js';
console.log(value);
```

Output with `output.minifyInternalExports: true`:

```js
// main.js
import './main-5532def0.js';

// main-5532def0.js
import('./dynamic-402de2f0.js');
const importantValue = 42;

export { importantValue as i };

// dynamic-402de2f0.js
import { i as importantValue } from './main-5532def0.js';

console.log(importantValue);
```

Output with `output.minifyInternalExports: false`:

```js
// main.js
import './main-5532def0.js';

// main-5532def0.js
import('./dynamic-402de2f0.js');
const importantValue = 42;

export { importantValue };

// dynamic-402de2f0.js
import { importantValue } from './main-5532def0.js';

console.log(importantValue);
```

Even though it appears that setting this option to `true` makes the output larger, it actually makes it smaller if a minifier is used. In this case, `export { importantValue as i }` can become e.g. `export{a as i}` or even `export{i}`, while otherwise it would produce `export{ a as importantValue }` because a minifier usually will not change export signatures.

#### output.paths

Type: `{ [id: string]: string } | ((id: string) => string)`

Maps external module IDs to paths. External ids are ids that [cannot be resolved](guide/en/#warning-treating-module-as-external-dependency) or ids explicitly provided by the [`external`](guide/en/#external) option. Paths supplied by `output.paths` will be used in the generated bundle instead of the module ID, allowing you to, for example, load dependencies from a CDN:

```js
// app.js
import { selectAll } from 'd3';
selectAll('p').style('color', 'purple');
// ...

// rollup.config.js
export default {
  input: 'app.js',
  external: ['d3'],
  output: {
    file: 'bundle.js',
    format: 'amd',
    paths: {
      d3: 'https://d3js.org/d3.v4.min'
    }
  }
};

// bundle.js
define(['https://d3js.org/d3.v4.min'], function (d3) {
  d3.selectAll('p').style('color', 'purple');
  // ...
});
```

#### output.preserveModules

Type: `boolean`<br> CLI: `--preserveModules`/`--no-preserveModules`<br> Default: `false`

Instead of creating as few chunks as possible, this mode will create separate chunks for all modules using the original module names as file names. Requires the [`output.dir`](guide/en/#outputdir) option. Tree-shaking will still be applied, suppressing files that are not used by the provided entry points or do not have side effects when executed. This mode can be used to transform a file structure to a different module format.

Note that when transforming to `cjs` or `amd` format, each file will by default be treated as an entry point with [`output.exports`](guide/en/#outputexports) set to `auto`. This means that e.g. for `cjs`, a file that only contains a default export will be rendered as

```js
// input main.js
export default 42;

// output main.js
('use strict');

var main = 42;

module.exports = main;
```

assigning the value directly to `module.exports`. If someone imports this file, they will get access to the default export via

```js
const main = require('./main.js');
console.log(main); // 42
```

As with regular entry points, files that mix default and named exports will produce warnings. You can avoid the warnings by forcing all files to use named export mode via `output.exports: "named"`. In that case, the default export needs to be accessed via the `.default` property of the export:

```js
// input main.js
export default 42;

// output main.js
('use strict');

Object.defineProperty(exports, '__esModule', { value: true });

var main = 42;

exports.default = main;

// consuming file
const main = require('./main.js');
console.log(main.default); // 42
```

#### output.preserveModulesRoot

Type: `string`<br> CLI: `--preserveModulesRoot <directory-name>`

A directory path to input modules that should be stripped away from [`output.dir`](guide/en/#outputdir) path while [`output.preserveModules`](guide/en#outputpreservemodules) is `true`.

For example, given the following configuration:

```javascript
export default {
  input: ['src/module.js', `src/another/module.js`],
  output: [
    {
      format: 'es',
      dir: 'dist',
      preserveModules: true,
      preserveModulesRoot: 'src'
    }
  ]
};
```

The `preserveModulesRoot` setting ensures that the input modules will be output to the paths `dist/module.js` and `dist/another/module.js`.

This option is particularly useful while using plugins such as `@rollup/plugin-node-resolve`, which may cause changes in the output directory structure. This can happen when third-party modules are not marked [`external`](guide/en/#external), or while developing in a monorepo of multiple packages that rely on one another and are not marked [`external`](guide/en/#external).

#### output.sourcemap

Type: `boolean | 'inline' | 'hidden'`<br> CLI: `-m`/`--sourcemap`/`--no-sourcemap`<br> Default: `false`

If `true`, a separate sourcemap file will be created. If `"inline"`, the sourcemap will be appended to the resulting `output` file as a data URI. `"hidden"` works like `true` except that the corresponding sourcemap comments in the bundled files are suppressed.

#### output.sourcemapExcludeSources

Type: `boolean`<br> CLI: `--sourcemapExcludeSources`/`--no-sourcemapExcludeSources`<br> Default: `false`

If `true`, the actual code of the sources will not be added to the sourcemaps making them considerably smaller.

#### output.sourcemapFile

Type: `string`<br> CLI: `--sourcemapFile <file-name-with-path>`

The location of the generated bundle. If this is an absolute path, all the `sources` paths in the sourcemap will be relative to it. The `map.file` property is the basename of `sourcemapFile`, as the location of the sourcemap is assumed to be adjacent to the bundle.

`sourcemapFile` is not required if `output` is specified, in which case an output filename will be inferred by adding ".map" to the output filename for the bundle.

#### output.sourcemapPathTransform

Type: `(relativeSourcePath: string, sourcemapPath: string) => string`

A transformation to apply to each path in a sourcemap. `relativeSourcePath` is a relative path from the generated `.map` file to the corresponding source file while `sourcemapPath` is the fully resolved path of the generated sourcemap file.

```js
import path from 'path';
export default {
  input: 'src/main',
  output: [
    {
      file: 'bundle.js',
      sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
        // will replace relative paths with absolute paths
        return path.resolve(path.dirname(sourcemapPath), relativeSourcePath);
      },
      format: 'es',
      sourcemap: true
    }
  ]
};
```

#### output.validate

Type: `boolean`<br> CLI: `--validate`/`--no-validate`<br> Default: `false`

Re-parses each generated chunk to detect if the generated code is valid JavaScript. This can be useful to debug output generated by plugins that use the [`renderChunk`](guide/en/#renderchunk) hook to transform code.

If the code is invalid, a warning will be issued. Note that no error is thrown so that you can still inspect the generated output. To promote this warning to an error, you can watch for it in an [`onwarn`](guide/en/#onwarn) handler.

#### preserveEntrySignatures

Type: `"strict" | "allow-extension" | "exports-only" | false`<br> CLI: `--preserveEntrySignatures <strict|allow-extension>`/`--no-preserveEntrySignatures`<br> Default: `"strict"`

Controls if Rollup tries to ensure that entry chunks have the same exports as the underlying entry module.

- If set to `"strict"`, Rollup will create exactly the same exports in the entry chunk as there are in the corresponding entry module. If this is not possible because additional internal exports need to be added to a chunk, Rollup will instead create a "facade" entry chunk that reexports just the necessary bindings from other chunks but contains no code otherwise. This is the recommended setting for libraries.
- `"allow-extension"` will create all exports of the entry module in the entry chunk but may also add additional exports if necessary, avoiding a "facade" entry chunk. This setting makes sense for libraries where a strict signature is not required.
- `"exports-only"` behaves like `"strict"` if the entry module has exports, otherwise it behaves like `"allow-extension"`.
- `false` will not add any exports of an entry module to the corresponding chunk and does not even include the corresponding code unless those exports are used elsewhere in the bundle. Internal exports may be added to entry chunks, though. This is the recommended setting for web apps where the entry chunks are to be placed in script tags as it may reduce both the number of chunks and possibly the bundle size.

**Example**<br> Input:

```js
// main.js
import { shared } from './lib.js';
export const value = `value: ${shared}`;
import('./dynamic.js');

// lib.js
export const shared = 'shared';

// dynamic.js
import { shared } from './lib.js';
console.log(shared);
```

Output for `preserveEntrySignatures: "strict"`:

```js
// main.js
export { v as value } from './main-50a71bb6.js';

// main-50a71bb6.js
const shared = 'shared';

const value = `value: ${shared}`;
import('./dynamic-cd23645f.js');

export { shared as s, value as v };

// dynamic-cd23645f.js
import { s as shared } from './main-50a71bb6.js';

console.log(shared);
```

Output for `preserveEntrySignatures: "allow-extension"`:

```js
// main.js
const shared = 'shared';

const value = `value: ${shared}`;
import('./dynamic-298476ec.js');

export { shared as s, value };

// dynamic-298476ec.js
import { s as shared } from './main.js';

console.log(shared);
```

Output for `preserveEntrySignatures: false`:

```js
// main.js
import('./dynamic-39821cef.js');

// dynamic-39821cef.js
const shared = 'shared';

console.log(shared);
```

At the moment, the only way to override this setting for individual entry chunks is to use the plugin API and emit those chunks via [`this.emitFile`](guide/en/#thisemitfile) instead of using the [`input`](guide/en/#input) option.

#### strictDeprecations

Type: `boolean`<br> CLI: `--strictDeprecations`/`--no-strictDeprecations`<br> Default: `false`

When this flag is enabled, Rollup will throw an error instead of showing a warning when a deprecated feature is used. Furthermore, features that are marked to receive a deprecation warning with the next major version will also throw an error when used.

This flag is intended to be used by e.g. plugin authors to be able to adjust their plugins for upcoming major releases as early as possible.

### Danger zone

You probably don't need to use these options unless you know what you are doing!

#### acorn

Type: `AcornOptions`

Any options that should be passed through to Acorn's `parse` function, such as `allowReserved: true`. Cf. the [Acorn documentation](https://github.com/acornjs/acorn/tree/master/acorn#interface) for more available options.

#### acornInjectPlugins

Type: `AcornPluginFunction | AcornPluginFunction[]`

A single plugin or an array of plugins to be injected into Acorn. For instance to use JSX syntax, you can specify

```javascript
import jsx from 'acorn-jsx';

export default {
  // … other options …
  acornInjectPlugins: [jsx()]
};
```

in your rollup configuration. Note that this is different from using Babel in that the generated output will still contain JSX while Babel will replace it with valid JavaScript.

#### context

Type: `string`<br> CLI: `--context <contextVariable>`<br> Default: `undefined`

By default, the context of a module – i.e., the value of `this` at the top level – is `undefined`. In rare cases you might need to change this to something else, like `'window'`.

#### moduleContext

Type: `((id: string) => string) | { [id: string]: string }`<br>

Same as [`context`](guide/en/#context), but per-module – can either be an object of `id: context` pairs, or an `id => context` function.

#### output.amd

Type: `{ id?: string, autoId?: boolean, basePath?: string, define?: string }`

Note `id` can only be used for single-file builds, and cannot be combined with `autoId`/`basePath`.

**output.amd.id**<br> Type: `string`<br> CLI: `--amd.id <amdId>`

An ID to use for AMD/UMD bundles:

```js
// rollup.config.js
export default {
  ...,
  format: 'amd',
  amd: {
    id: 'my-bundle'
  }
};

// -> define('my-bundle', ['dependency'], ...
```

**output.amd.autoId**<br> Type: `boolean`<br> CLI: `--amd.autoId`

Set the ID to the chunk ID (with the '.js' extension removed).

```js
// rollup.config.js
export default {
  ...,
  format: 'amd',
  amd: {
    autoId: true
  }
};

// -> define('main', ['dependency'], ...
// -> define('dynamic-chunk', ['dependency'], ...
```

**output.amd.basePath**<br> Type: `string`<br> CLI: `--amd.basePath`

The path that will be prepended to the auto generated ID. This is useful if the build is going to be placed inside another AMD project, and is not at the root.

Only valid with `output.amd.autoId`.

```js
// rollup.config.js
export default {
  ...,
  format: 'amd',
  amd: {
    autoId: true
    basePath: 'some/where'
  }
};

// -> define('some/where/main', ['dependency'], ...
// -> define('some/where/dynamic-chunk', ['dependency'], ...
```

**output.amd.define**<br> Type: `string`<br> CLI: `--amd.define <defineFunctionName>`

A function name to use instead of `define`:

```js
// rollup.config.js
export default {
  ...,
  format: 'amd',
  amd: {
    define: 'def'
  }
};

// -> def(['dependency'],...
```

#### output.esModule

Type: `boolean`<br> CLI: `--esModule`/`--no-esModule`<br> Default: `true`

Whether to add a `__esModule: true` property when generating exports for non-ES formats. This property signifies that the exported value is the namespace of an ES module and that the default export of this module corresponds to the `.default` property of the exported object. By default, Rollup adds this property when using [named exports mode](guide/en/#outputexports) for a chunk. See also [`output.interop`](https://rollupjs.org/guide/en/#outputinterop).

#### output.exports

Type: `string`<br> CLI: `--exports <exportMode>`<br> Default: `'auto'`

What export mode to use. Defaults to `auto`, which guesses your intentions based on what the `input` module exports:

- `default` – if you are only exporting one thing using `export default ...`; note that this can cause issues when generating CommonJS output that is meant to be interchangeable with ESM output, see below
- `named` – if you are using named exports
- `none` – if you are not exporting anything (e.g. you are building an app, not a library)

As this is only an output transformation, you can only choose `default` if a default export is the only export for all entry chunks. Likewise, you can only choose `none` if there are no exports, otherwise Rollup will throw an error.

The difference between `default` and `named` affects how other people can consume your bundle. If you use `default`, a CommonJS user could do this, for example:

```js
// your-lib package entry
export default 'Hello world';

// a CommonJS consumer
/* require( "your-lib" ) returns "Hello World" */
const hello = require('your-lib');
```

With `named`, a user would do this instead:

```js
// your-lib package entry
export const hello = 'Hello world';

// a CommonJS consumer
/* require( "your-lib" ) returns {hello: "Hello World"} */
const hello = require('your-lib').hello;
/* or using destructuring */
const { hello } = require('your-lib');
```

The wrinkle is that if you use `named` exports but _also_ have a `default` export, a user would have to do something like this to use the default export:

```js
// your-lib package entry
export default 'foo';
export const bar = 'bar';

// a CommonJS consumer
/* require( "your-lib" ) returns {default: "foo", bar: "bar"} */
const foo = require('your-lib').default;
const bar = require('your-lib').bar;
/* or using destructuring */
const { default: foo, bar } = require('your-lib');
```

Note: There are some tools such as Babel, TypeScript, Webpack, and `@rollup/plugin-commonjs` that are capable of resolving a CommonJS `require(...)` call with an ES module. If you are generating CommonJS output that is meant to be interchangeable with ESM output for those tools, you should always use `named` export mode. The reason is that most of those tools will by default return the namespace of an ES module on `require` where the default export is the `.default` property.

In other words for those tools, you cannot create a package interface where `const lib = require("your-lib")` yields the same as `import lib from "your-lib"`. With named export mode however, `const {lib} = require("your-lib")` will be equivalent to `import {lib} from "your-lib"`.

To alert you to this, Rollup will generate a warning when you encounter such a situation and did not select an explicit value for `output.exports`.

#### output.externalLiveBindings

Type: `boolean`<br> CLI: `--externalLiveBindings`/`--no-externalLiveBindings`<br> Default: `true`

When set to `false`, Rollup will not generate code to support live bindings for external imports but instead assume that exports do not change over time. This will enable Rollup to generate more optimized code. Note that this can cause issues when there are circular dependencies involving an external dependency.

This will avoid most cases where Rollup generates getters in the code and can therefore be used to make code IE8 compatible in many cases.

Example:

```js
// input
export { x } from 'external';

// CJS output with externalLiveBindings: true
Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

Object.defineProperty(exports, 'x', {
  enumerable: true,
  get: function () {
    return external.x;
  }
});

// CJS output with externalLiveBindings: false
Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

exports.x = external.x;
```

#### output.freeze

Type: `boolean`<br> CLI: `--freeze`/`--no-freeze`<br> Default: `true`

Whether to `Object.freeze()` namespace import objects (i.e. `import * as namespaceImportObject from...`) that are accessed dynamically.

#### output.indent

Type: `boolean | string`<br> CLI: `--indent`/`--no-indent`<br> Default: `true`

The indent string to use, for formats that require code to be indented (`amd`, `iife`, `umd`, `system`). Can also be `false` (no indent), or `true` (the default – auto-indent)

```js
// rollup.config.js
export default {
  ...,
  output: {
    ...,
    indent: false
  }
};
```

#### output.namespaceToStringTag

Type: `boolean`<br> CLI: `--namespaceToStringTag`/`--no-namespaceToStringTag`<br> Default: `false`

Whether to add spec compliant `.toString()` tags to namespace objects. If this option is set,

```javascript
import * as namespace from './file.js';
console.log(String(namespace));
```

will always log `[object Module]`;

#### output.noConflict

Type: `boolean`<br> CLI: `--noConflict`/`--no-noConflict`<br> Default: `false`

This will generate an additional `noConflict` export to UMD bundles. When called in an IIFE scenario, this method will return the bundle exports while restoring the corresponding global variable to its previous value.

#### output.preferConst

Type: `boolean`<br> CLI: `--preferConst`/`--no-preferConst`<br> Default: `false`

Generate `const` declarations for exports rather than `var` declarations.

#### output.sanitizeFileName

Type: `boolean | (string) => string`<br> CLI: `--sanitizeFileName`/`no-sanitizeFileName` Default: `true`

Set to `false` to disable all chunk name sanitizations (removal of `\0`, `?` and `*` characters).

Alternatively set to a function to allow custom chunk name sanitization.

#### output.strict

Type: `boolean`<br> CLI: `--strict`/`--no-strict`<br> Default: `true`

Whether to include the 'use strict' pragma at the top of generated non-ES bundles. Strictly speaking, ES modules are _always_ in strict mode, so you shouldn't disable this without good reason.

#### output.systemNullSetters

Type: `boolean`<br> CLI: `--systemNullSetters`/`--no-systemNullSetters`<br> Default: `false`

When outputting the `system` module format, this will replace empty setter functions with `null` as an output simplification. This is _only supported in SystemJS 6.3.3 and above_.

#### preserveSymlinks

Type: `boolean`<br> CLI: `--preserveSymlinks`<br> Default: `false`

When set to `false`, symbolic links are followed when resolving a file. When set to `true`, instead of being followed, symbolic links are treated as if the file is where the link is. To illustrate, consider the following situation:

```js
// /main.js
import { x } from './linked.js';
console.log(x);

// /linked.js
// this is a symbolic link to /nested/file.js

// /nested/file.js
export { x } from './dep.js';

// /dep.js
export const x = 'next to linked';

// /nested/dep.js
export const x = 'next to original';
```

If `preserveSymlinks` is `false`, then the bundle created from `/main.js` will log "next to original" as it will use the location of the symbolically linked file to resolve its dependencies. If `preserveSymlinks` is `true`, however, it will log "next to linked" as the symbolic link will not be resolved.

#### shimMissingExports

Type: `boolean`<br> CLI: `--shimMissingExports`/`--no-shimMissingExports`<br> Default: `false`

If this option is provided, bundling will not fail if bindings are imported from a file that does not define these bindings. Instead, new variables will be created for these bindings with the value `undefined`.

#### treeshake

Type: `boolean | "smallest" | "safest" | "recommended" | { annotations?: boolean, correctVarValueBeforeDeclaration?: boolean, moduleSideEffects?: ModuleSideEffectsOption, preset?: "smallest" | "safest" | "recommended", propertyReadSideEffects?: boolean | 'always', tryCatchDeoptimization?: boolean, unknownGlobalSideEffects?: boolean }`<br> CLI: `--treeshake`/`--no-treeshake`<br> Default: `true`

Whether to apply tree-shaking and to fine-tune the tree-shaking process. Setting this option to `false` will produce bigger bundles but may improve build performance. You may also choose one of three presets that will automatically be updated if new options are added:

- `"smallest"` will choose option values for you to minimize output size as much as possible. This should work for most code bases as long as you do not rely on certain patterns, which are currently:
  - getters with side effects will only be retained if the return value is used (`treeshake.propertyReadSideEffects: false`)
  - code from imported modules will only be retained if at least one exported value is used (`treeshake.moduleSideEffects: false`)
  - you should not bundle polyfills that rely on detecting broken builtins (`treeshake.tryCatchDeoptimization: false`)
  - some semantic issues may be swallowed (`treeshake.unknownGlobalSideEffects: false`, `treeshake.correctVarValueBeforeDeclaration: false`)
- `"recommended"` should work well for most usage patterns. Some semantic issues may be swallowed, though (`treeshake.unknownGlobalSideEffects: false`, `treeshake.correctVarValueBeforeDeclaration: false`)
- `"safest"` tries to be as spec compliant as possible while still providing some basic tree-shaking capabilities.
- `true` is equivalent to not specifying the option and will always choose the default value (see below).

If you discover a bug caused by the tree-shaking algorithm, please file an issue! Setting this option to an object implies tree-shaking is enabled and grants the following additional options:

**treeshake.annotations**<br> Type: `boolean`<br> CLI: `--treeshake.annotations`/`--no-treeshake.annotations`<br> Default: `true`

If `false`, ignore hints from pure annotations, i.e. comments containing `@__PURE__` or `#__PURE__`, when determining side effects of function calls and constructor invocations. These annotations need to immediately precede the call invocation to take effect. The following code will be completely removed unless this option is set to `false`, in which case it will remain unchanged.

```javascript
/*@__PURE__*/ console.log('side-effect');

class Impure {
  constructor() {
    console.log('side-effect');
  }
}

/*@__PURE__*/ new Impure();
```

**treeshake.correctVarValueBeforeDeclaration**<br> Type: `boolean`<br> CLI: `--treeshake.correctVarValueBeforeDeclaration`/`--no-treeshake.correctVarValueBeforeDeclaration`<br> Default: `false`

In some edge cases if a variable is accessed before its declaration assignment and is not reassigned, then Rollup may incorrectly assume that variable is constant throughout the program, as in the example below. This is not true if the variable is declared with `var`, however, as those variables can be accessed before their declaration where they will evaluate to `undefined`. Choosing `true` will make sure Rollup does not make any assumptions about the value of variables declared with `var`. Note though that this can have a noticeable negative impact on tree-shaking results.

```js
// everything will be tree-shaken unless treeshake.correctVarValueBeforeDeclaration === true
let logBeforeDeclaration = false;

function logIfEnabled() {
  if (logBeforeDeclaration) {
    log();
  }

  var value = true;

  function log() {
    if (!value) {
      console.log('should be retained, value is undefined');
    }
  }
}

logIfEnabled(); // could be removed
logBeforeDeclaration = true;
logIfEnabled(); // needs to be retained as it displays a log
```

**treeshake.moduleSideEffects**<br> Type: `boolean | "no-external" | string[] | (id: string, external: boolean) => boolean`<br> CLI: `--treeshake.moduleSideEffects`/`--no-treeshake.moduleSideEffects`/`--treeshake.moduleSideEffects no-external`<br> Default: `true`

If `false`, assume modules and external dependencies from which nothing is imported do not have other side effects like mutating global variables or logging without checking. For external dependencies, this will suppress empty imports:

```javascript
// input file
import { unused } from 'external-a';
import 'external-b';
console.log(42);
```

```javascript
// output with treeshake.moduleSideEffects === true
import 'external-a';
import 'external-b';
console.log(42);
```

```javascript
// output with treeshake.moduleSideEffects === false
console.log(42);
```

For non-external modules, `false` will not include any statements from a module unless at least one import from this module is included:

```javascript
// input file a.js
import { unused } from './b.js';
console.log(42);

// input file b.js
console.log('side-effect');
const ignored = 'will still be removed';
```

```javascript
// output with treeshake.moduleSideEffects === true
console.log('side-effect');

console.log(42);
```

```javascript
// output with treeshake.moduleSideEffects === false
console.log(42);
```

You can also supply a list of modules with side effects or a function to determine it for each module individually. The value `"no-external"` will only remove external imports if possible and is equivalent to the function `(id, external) => !external`;

If a module that has this flag set to `false` reexports a variable from another module and this variable is used, the question if the reexporting module is scanned for side effects depends on how the variable is reexported:

```javascript
// input file a.js
import { foo } from './b.js';
console.log(foo);

// input file b.js
// direct reexports will ignore side effects
export { foo } from './c.js';
console.log('this side-effect is ignored');

// input file c.js
// indirect reexports will include side effects
import { foo } from './d.js';
foo.mutated = true;
console.log('this side-effect and the mutation are retained');
export { foo };

// input file d.js
export const foo = 42;
```

```javascript
// output with treeshake.moduleSideEffects === false
const foo = 42;

foo.mutated = true;
console.log('this side-effect and the mutation are retained');

console.log(foo);
```

Note that despite the name, this option does not "add" side effects to modules that do not have side effects. If it is important that e.g. an empty module is "included" in the bundle because you need this for dependency tracking, the plugin interface allows you to designate modules as being excluded from tree-shaking via the [`resolveId`](guide/en/#resolveid), [`load`](guide/en/#load) or [`transform`](guide/en/#transform) hook.

**treeshake.preset**<br> Type: `"smallest" | "safest" | "recommended"`<br> CLI: `--treeshake <value>`<br>

Allows choosing one of the presets listed above while overriding some options.

```js
export default {
  treeshake: {
    preset: 'smallest',
    propertyReadSideEffects: true
  }
  // ...
};
```

**treeshake.propertyReadSideEffects**<br> Type: `boolean | 'always'`<br> CLI: `--treeshake.propertyReadSideEffects`/`--no-treeshake.propertyReadSideEffects`<br> Default: `true`

If `true`, retain unused property reads that Rollup can determine to have side-effects. This includes accessing properties of `null` or `undefined` or triggering explicit getters via property access. Note that this does not cover destructuring assignment or getters on objects passed as function parameters.

If `false`, assume reading a property of an object never has side effects. Depending on your code, disabling this option can significantly reduce bundle size but can potentially break functionality if you rely on getters or errors from illegal property access.

If `'always'`, assume all member property accesses, including destructuring, have side effects. This setting is recommended for code relying on getters with side effects. It typically results in larger bundle size, but smaller than disabling `treeshake` altogether.

```javascript
// Will be removed if treeshake.propertyReadSideEffects === false
const foo = {
  get bar() {
    console.log('effect');
    return 'bar';
  }
};
const result = foo.bar;
const illegalAccess = foo.quux.tooDeep;
```

**treeshake.tryCatchDeoptimization**<br> Type: `boolean`<br> CLI: `--treeshake.tryCatchDeoptimization`/`--no-treeshake.tryCatchDeoptimization`<br> Default: `true`

By default, Rollup assumes that many builtin globals of the runtime behave according to the latest specs when tree-shaking and do not throw unexpected errors. In order to support e.g. feature detection workflows that rely on those errors being thrown, Rollup will by default deactivate tree-shaking inside try-statements. If a function parameter is called from within a try-statement, this parameter will be deoptimized as well. Set `treeshake.tryCatchDeoptimization` to `false` if you do not need this feature and want to have tree-shaking inside try-statements.

```js
function otherFn() {
  // even though this function is called from a try-statement, the next line
  // will be removed as side-effect-free
  Object.create(null);
}

function test(callback) {
  try {
    // calls to otherwise side-effect-free global functions are retained
    // inside try-statements for tryCatchDeoptimization: true
    Object.create(null);

    // calls to other function are retained as well but the body of this
    // function may again be subject to tree-shaking
    otherFn();

    // if a parameter is called, then all arguments passed to that function
    // parameter will be deoptimized
    callback();
  } catch {}
}

test(() => {
  // will be ratained
  Object.create(null);
});

// call will be retained but again, otherFn is not deoptimized
test(otherFn);
```

**treeshake.unknownGlobalSideEffects**<br> Type: `boolean`<br> CLI: `--treeshake.unknownGlobalSideEffects`/`--no-treeshake.unknownGlobalSideEffects`<br> Default: `true`

Since accessing a non-existing global variable will throw an error, Rollup does by default retain any accesses to non-builtin global variables. Set this option to `false` to avoid this check. This is probably safe for most code-bases.

```js
// input
const jQuery = $;
const requestTimeout = setTimeout;
const element = angular.element;

// output with unknownGlobalSideEffects == true
const jQuery = $;
const element = angular.element;

// output with unknownGlobalSideEffects == false
const element = angular.element;
```

In the example, the last line is always retained as accessing the `element` property could also throw an error if `angular` is e.g. `null`. To avoid this check, set `treeshake.propertyReadSideEffects` to `false` as well.

### Experimental options

These options reflect new features that have not yet been fully finalized. Availability, behaviour and usage may therefore be subject to change between minor versions.

#### experimentalCacheExpiry

Type: `number`<br> CLI: `--experimentalCacheExpiry <numberOfRuns>`<br> Default: `10`

Determines after how many runs cached assets that are no longer used by plugins should be removed.

#### perf

Type: `boolean`<br> CLI: `--perf`/`--no-perf`<br> Default: `false`

Whether to collect performance timings. When used from the command line or a configuration file, detailed measurements about the current bundling process will be displayed. When used from the [JavaScript API](guide/en/#javascript-api), the returned bundle object will contain an additional `getTimings()` function that can be called at any time to retrieve all accumulated measurements.

`getTimings()` returns an object of the following form:

```
{
  "# BUILD": [ 698.020877, 33979632, 45328080 ],
  "## parse modules": [ 537.509342, 16295024, 27660296 ],
  "load modules": [ 33.253778999999994, 2277104, 38204152 ],
  ...
}
```

For each key, the first number represents the elapsed time while the second represents the change in memory consumption, and the third represents the total memory consumption after this step. The order of these steps is the order used by `Object.keys`. Top level keys start with `#` and contain the timings of nested steps, i.e. in the example above, the 698ms of the `# BUILD` step include the 538ms of the `## parse modules` step.

### Watch options

Type: `{ buildDelay?: number, chokidar?: ChokidarOptions, clearScreen?: boolean, exclude?: string, include?: string, skipWrite?: boolean } | false`<br> Default: `{}`<br>

Specify options for watch mode or prevent this configuration from being watched. Specifying `false` is only really useful when an array of configurations is used. In that case, this configuration will not be built or rebuilt on change in watch mode, but it will be built when running Rollup regularly:

```js
// rollup.config.js
export default [
  {
    input: 'main.js',
    output: { file: 'bundle.cjs.js', format: 'cjs' }
  },
  {
    input: 'main.js',
    watch: false,
    output: { file: 'bundle.es.js', format: 'es' }
  }
];
```

These options only take effect when running Rollup with the `--watch` flag, or using `rollup.watch`.

#### watch.buildDelay

Type: `number`<br> CLI: `--watch.buildDelay <number>`<br> Default: `0`

Configures how long Rollup will wait for further changes until it triggers a rebuild in milliseconds. By default, Rollup does not wait but there is a small debounce timeout configured in the chokidar instance. Setting this to a value greater than `0` will mean that Rollup will only trigger a rebuild if there was no change for the configured number of milliseconds. If several configurations are watched, Rollup will use the largest configured build delay.

#### watch.chokidar

Type: `ChokidarOptions`<br>

An optional object of watch options that will be passed to the bundled [chokidar](https://github.com/paulmillr/chokidar) instance. See the [chokidar documentation](https://github.com/paulmillr/chokidar#api) to find out what options are available.

#### watch.clearScreen

Type: `boolean`<br> CLI: `--watch.clearScreen`/`--no-watch.clearScreen`<br> Default: `true`

Whether to clear the screen when a rebuild is triggered.

#### watch.exclude

Type: `string | RegExp | (string | RegExp)[]`<br> CLI: `--watch.exclude <files>`

Prevent files from being watched:

```js
// rollup.config.js
export default {
  ...,
  watch: {
    exclude: 'node_modules/**'
  }
};
```

#### watch.include

Type: `string | RegExp | (string | RegExp)[]`<br> CLI: `--watch.include <files>`

Limit the file-watching to certain files. Note that this only filters the module graph but does not allow adding additional watch files:

```js
// rollup.config.js
export default {
  ...,
  watch: {
    include: 'src/**'
  }
};
```

#### watch.skipWrite

Type: `boolean`<br> CLI: `--watch.skipWrite`/`--no-watch.skipWrite`<br> Default: `false`

Whether to skip the `bundle.write()` step when a rebuild is triggered.

### Deprecated options

☢️ These options have been deprecated and may be removed in a future Rollup version.

#### inlineDynamicImports

_Use the [`output.inlineDynamicImports`](guide/en/#outputinlinedynamicimports) output option instead, which has the same signature._

#### manualChunks

_Use the [`output.manualChunks`](guide/en/#outputmanualchunks) output option instead, which has the same signature._

#### preserveModules

_Use the [`output.preserveModules`](guide/en/#outputpreservemodules) output option instead, which has the same signature._

#### output.dynamicImportFunction

_Use the [`renderDynamicImport`](guide/en/#renderdynamicimport) plugin hook instead._<br> Type: `string`<br> CLI: `--dynamicImportFunction <name>`<br> Default: `import`

This will rename the dynamic import function to the chosen name when outputting ES bundles. This is useful for generating code that uses a dynamic import polyfill such as [this one](https://github.com/uupaa/dynamic-import-polyfill).

#### output.preferConst

_Use the [`output.generatedCode.constBindings`](guide/en/#outputgeneratedcode) option instead._<br> Type: `boolean`<br> CLI: `--preferConst`/`--no-preferConst`<br> Default: `false`

Generate `const` declarations for exports rather than `var` declarations.

#### treeshake.pureExternalModules

_Use [`treeshake.moduleSideEffects: 'no-external'`](guide/en/#treeshake) instead._<br> Type: `boolean | string[] | (id: string) => boolean | null`<br> CLI: `--treeshake.pureExternalModules`/`--no-treeshake.pureExternalModules`<br> Default: `false`

If `true`, assume external dependencies from which nothing is imported do not have other side effects like mutating global variables or logging.

```javascript
// input file
import { unused } from 'external-a';
import 'external-b';
console.log(42);
```

```javascript
// output with treeshake.pureExternalModules === false
import 'external-a';
import 'external-b';
console.log(42);
```

```javascript
// output with treeshake.pureExternalModules === true
console.log(42);
```

You can also supply a list of external ids to be considered pure or a function that is called whenever an external import could be removed.
