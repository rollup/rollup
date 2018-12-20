---
title: Big list of options
---

### Core functionality

#### input *`-i`/`--input`*

`String` / `String[]` / `{ [entryName: String]: String }` The bundle's entry point(s) (e.g. your `main.js` or `app.js` or `index.js`). If you enable `experimentalCodeSplitting`, you can provide an array of entry points or object of named entry points which will be bundled to separate output chunks.

#### output.file *`-o`/`--file`*

`String` The file to write to. Will also be used to generate sourcemaps, if applicable. If `experimentalCodeSplitting` is enabled and `input` is an array, you must specify `dir` instead of `file`.

#### output.dir * `--dir`*

`String` The directory in which all generated chunks are placed. Only used if `experimentalCodeSplitting` is enabled and `input` is an array. In these cases this option replaces `file`.

#### output.format *`-f`/`--format`*

`String` The format of the generated bundle. One of the following:

* `amd` – Asynchronous Module Definition, used with module loaders like RequireJS
* `cjs` – CommonJS, suitable for Node and Browserify/Webpack
* `esm` – Keep the bundle as an ES module file
* `iife` – A self-executing function, suitable for inclusion as a `<script>` tag. (If you want to create a bundle for your application, you probably want to use this, because it leads to smaller file sizes.)
* `umd` – Universal Module Definition, works as `amd`, `cjs` and `iife` all in one
* `system` – Native format of the SystemJS loader

#### output.name *`-n`/`--name`*

`String` The variable name, representing your `iife`/`umd` bundle, by which other scripts on the same page can access it.

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

// -> const MyBundle = (function () {...
```

Namespaces are supported, so your name can contain dots. The resulting bundle will contain the setup necessary for the namespacing.

```
$ rollup -n "a.b.c"

/* ->
this.a = this.a || {};
this.a.b = this.a.b || {};
this.a.b.c = ...
*/
```

#### plugins

`Array` of plugin objects (or a single plugin object) – see [Using plugins](guide/en#using-plugins) for more information. Remember to call the imported plugin function (i.e. `commonjs()`, not just `commonjs`). Falsy plugins will be ignored, which can be used to easily activate or deactivate plugins.

```js
// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import {terser} from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  entry: 'main.js',
  plugins: [
    resolve(),
    commonjs(),
    isProduction && terser()
  ]
};
```

#### external *`-e`/`--external`*

Either a `Function` that takes an `id` and returns `true` (external) or `false` (not external), or an `Array` of module IDs that should remain external to the bundle. The IDs should be either:

1. the name of an external dependency, exactly the way it is written in the import statement. I.e. to mark `import "dependency.js"` as external, use `"dependency.js"` while to mark `import "dependency"` as external, use `"dependency"`
2. a resolved ID (like an absolute path to a file)

```js
// rollup.config.js
import path from 'path';

export default {
  ...,
  external: [
    'some-externally-required-library',
    path.resolve( __dirname, 'src/some-local-file-that-should-not-be-bundled.js' )
  ]
};
```

When given as a command line argument, it should be a comma-separated list of IDs:

```bash
rollup -i src/main.js ... -e foo,bar,baz
```

When providing a function, it is actually called with three parameters `(id, parent, isResolved)` that can give you more fine-grained control:

* `id` is the id of the module in question
* `parent` is the id of the module doing the import
* `isResolved` signals whether the `id` has been resolved by e.g. plugins

When creating an `iife` or `umd` bundle, you will need to provide global variable names to replace your external imports via the `output.globals` option.


#### output.globals *`-g`/`--globals`*

`Object` of `id: name` pairs, used for `umd`/`iife` bundles. For example, in a case like this...

```js
import $ from 'jquery';
```

...we want to tell Rollup that `jquery` is external and the `jquery` module ID equates to the global `$` variable:

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
const MyBundle = (function ($) {
  // code goes here
}(window.jQuery));
*/
```

Alternatively, supply a function that will turn an external module ID into a global.

When given as a command line argument, it should be a comma-separated list of `id:name` pairs:

```bash
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

### Advanced functionality

#### output.paths

`Function` that takes an ID and returns a path, or `Object` of `id: path` pairs. Where supplied, these paths will be used in the generated bundle instead of the module ID, allowing you to (for example) load dependencies from a CDN:

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

#### output.banner/output.footer *`-banner`/`--footer`*

`String` A string to prepend/append to the bundle. You can also supply a `Promise` that resolves to a `String` to generate it asynchronously (Note: `banner` and `footer` options will not break sourcemaps)

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

#### output.intro/output.outro *`--intro`/`--outro`*

`String` Similar to `banner` and `footer`, except that the code goes *inside* any format-specific wrapper. As with `banner` and `footer`, you can also supply a `Promise` that resolves to a `String`.

```js
export default {
  ...,
  output: {
    ...,
    intro: 'const ENVIRONMENT = "production";'
  }
};
```

#### cache

`Object | false` The `cache` property of a previous bundle. Use it to speed up subsequent builds — Rollup will only reanalyse the modules that have changed. Setting this option to `false` will prevent generating the `cache` property on the bundle and also deactivate caching for plugins.

```js
const rollup = require('rollup');
let cache;

async function buildWithCache() {
  const bundle = await rollup.rollup({
    cache, // is ignored if falsy
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
  })
```


#### onwarn

`Function` that will intercept warning messages. If not supplied, warnings will be deduplicated and printed to the console.

The function receives two arguments: the warning object and the default handler. Warnings objects have, at a minimum, a `code` and a `message` property, allowing you to control how different kinds of warnings are handled.

```js
onwarn (warning, warn) {
  // skip certain warnings
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

  // throw on others
  if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

  // Use default for everything else
  warn(warning);
}
```

Many warnings also have a `loc` property and a `frame` allowing you to locate the source of the warning:

```js
onwarn ({ loc, frame, message }) {
  // print location if applicable
  if (loc) {
    console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
    if (frame) console.warn(frame);
  } else {
    console.warn(message);
  }
}
```

#### output.sourcemap *`-m`/`--sourcemap`*

If `true`, a separate sourcemap file will be created. If `inline`, the sourcemap will be appended to the resulting `output` file as a data URI.

#### output.sourcemapFile *`--sourcemapFile`*

`String` The location of the generated bundle. If this is an absolute path, all the `sources` paths in the sourcemap will be relative to it. The `map.file` property is the basename of `sourcemapFile`, as the location of the sourcemap is assumed to be adjacent to the bundle.

`sourcemapFile` is not required if `output` is specified, in which case an output filename will be inferred by adding ".map"  to the output filename for the bundle.

#### output.sourcemapExcludeSources *`--sourcemapExcludeSources`*

`true` or `false` (defaults to `false`) – if `true`, the actual sources will not be added to the sourcemaps making them considerably smaller.

#### output.sourcemapPathTransform

`Function` A transformation to apply to each path in a sourcemap. For instance the following will change all paths to be relative to the `src` directory.

```js
import path from 'path';
export default ({
  input: 'src/main',
  output: [{
    file: 'bundle.js',
    sourcemapPathTransform: relativePath => {
      // will transform e.g. "src/main.js" -> "main.js"
      return path.relative('src', relativePath)
    },
    format: 'esm',
    sourcemap: true
  }]
});
```

#### output.interop *`--interop`/*`--no-interop`*

`true` or `false` (defaults to `true`) – whether or not to add an 'interop block'. By default (`interop: true`), for safety's sake, Rollup will assign any external dependencies' `default` exports to a separate variable if it's necessary to distinguish between default and named exports. This generally only applies if your external dependencies were transpiled (for example with Babel) – if you're sure you don't need it, you can save a few bytes with `interop: false`.

#### output.extend *`--extend`/*`--no-extend`*

`true` or `false` (defaults to `false`) – whether or not to extend the global variable defined by the `name` option in `umd` or `iife` formats. When `true`, the global variable will be defined as `(global.name = global.name || {})`. When false, the global defined by `name` will be overwritten like `(global.name = {})`.

#### perf *`--perf`*

⚠️ Details of this API are not considered stable and may change in minor versions.

`true` or `false` (defaults to `false`) – whether to collect performance timings. When used from the command line or a configuration file, detailed measurements about the current bundling process will be displayed. When used from the [JavaScript API](guide/en#javascript-api), the returned bundle object will contain an aditional `getTimings()` function that can be called at any time to retrieve all accumulated measurements.

`getTimings()` returns an object of the following form:

```json
{
  "# BUILD": [ 698.020877, 33979632, 45328080 ],
  "## parse modules": [ 537.509342, 16295024, 27660296 ],
  "load modules": [ 33.253778999999994, 2277104, 38204152 ],
  ...
}
```

For each key, the first number represents the elapsed time while the second represents the change in memory consumption and the third represents the total memory consumption after this step. The order of these steps is the order used by `Object.keys`. Top level keys start with `#` and contain the timings of nested steps, i.e. in the example above, the 698ms of the `# BUILD` step include the 538ms of the `## parse modules` step.

### Danger zone

You probably don't need to use these options unless you know what you're doing!

#### treeshake *`--treeshake`/`--no-treeshake`*

Can be `true`, `false` or an object (see below), defaults to `true`. Whether or not to apply tree-shaking and to fine-tune the tree-shaking process. Setting this option to `false` will produce bigger bundles but may improve build performance. If you discover a bug caused by the tree-shaking algorithm, please file an issue!
Setting this option to an object implies tree-shaking is enabled and grants the following additional options:

**treeshake.pureExternalModules** `true`/`false` (default: `false`). If `true`, assume external dependencies from which nothing is imported do not have other side-effects like mutating global variables or logging.

```javascript
// input file
import {unused} from 'external-a';
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

**treeshake.propertyReadSideEffects** `true`/`false` (default: `true`). If `false`, assume reading a property of an object never has side-effects. Depending on your code, disabling this option can significantly reduce bundle size but can potentially break functionality if you rely on getters or errors from illegal property access.

```javascript
// Will be removed if treeshake.propertyReadSideEffects === false
const foo = {
  get bar() {
    console.log('effect');
    return 'bar';
  }
}
const result = foo.bar;
const illegalAccess = foo.quux.tooDeep;
```

#### acorn

Any options that should be passed through to Acorn, such as `allowReserved: true`. Cf. the [Acorn documentation](https://github.com/acornjs/acorn/blob/master/README.md#main-parser) for more available options.

#### acornInjectPlugins

An array of plugins to be injected into Acorn. In order to use a plugin, you need to pass its inject function here and enable it via the `acorn.plugins` option. For instance, to use async iteration, you can specify

```javascript
import acornAsyncIteration from 'acorn-async-iteration/inject';

export default {
    // … other options …
    acorn: {
        plugins: { asyncIteration: true }
    },
    acornInjectPlugins: [
        acornAsyncIteration
    ]
};
```

in your rollup configuration.

#### context *`--context`*

`String` By default, the context of a module – i.e., the value of `this` at the top level – is `undefined`. In rare cases you might need to change this to something else, like `'window'`.

#### moduleContext

Same as `options.context`, but per-module – can either be an object of `id: context` pairs, or an `id => context` function.

#### output.exports *`--exports`*

`String` What export mode to use. Defaults to `auto`, which guesses your intentions based on what the `entry` module exports:

* `default` – suitable if you're only exporting one thing using `export default ...`
* `named` – suitable if you're exporting more than one thing
* `none` – suitable if you're not exporting anything (e.g. you're building an app, not a library)

The difference between `default` and `named` affects how other people can consume your bundle. If you use `default`, a CommonJS user could do this, for example:

```js
const yourLib = require( 'your-lib' );
```

With `named`, a user would do this instead:

```js
const yourMethod = require( 'your-lib' ).yourMethod;
```

The wrinkle is that if you use `named` exports but *also* have a `default` export, a user would have to do something like this to use the default export:

```js
const yourMethod = require( 'your-lib' ).yourMethod;
const yourLib = require( 'your-lib' )['default'];
```

#### output.amd *`--amd.id` and `--amd.define`*

`Object` Can contain the following properties:

**amd.id** `String` An ID to use for AMD/UMD bundles:

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

**amd.define** `String` A function name to use instead of `define`:

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

#### output.indent *`--indent`/`--no-indent`*

`String` the indent string to use, for formats that require code to be indented (`amd`, `iife`, `umd`). Can also be `false` (no indent), or `true` (the default – auto-indent)

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

#### output.strict *`--strict`/*`--no-strict`*

`true` or `false` (defaults to `true`) – whether to include the 'use strict' pragma at the top of generated non-ES6 bundles. Strictly-speaking (geddit?), ES6 modules are *always* in strict mode, so you shouldn't disable this without good reason.

#### output.freeze *`--freeze`/`--no-freeze`*

`true` or `false` (defaults to `true`) – wether to `Object.freeze()` namespace import objects (i.e. `import * as namespaceImportObject from...`) that are accessed dynamically.

#### output.namespaceToStringTag *`--namespaceToStringTag`/*`--no-namespaceToStringTag`*

`true` or `false` (defaults to `false`) – whether to add spec compliant `.toString()` tags to namespace objects. If this option is set,

```javascript
import * as namespace from './file.js';
console.log(String(namespace));
```

will always log `[object Module]`;

#### shimMissingExports *`--shimMissingExports`*

`true` or `false` (defaults to `false`) – if this option is provided, bundling will not fail if bindings are imported from a file that does not define these bindings. Instead, new variables will be created for these bindings with the value `undefined`.

### Experimental options

These options reflect new features that have not yet been fully finalized. Specific behaviour and usage may therefore be subject to change.

#### experimentalCodeSplitting *`--experimentalCodeSplitting`*
`true` or `false` (defaults to `false`) – enables the generation of multiple chunks. If this option is enabled, `input` can be set to an array or object of entry points to be built into the folder at the provided `output.dir`. See [input](guide/en#input-i-input) for more information

* Shared chunks are generated automatically to avoid code duplication between chunks.
* Dynamic imports will create new chunks instead of being inlined.

#### output.entryFileNames *`--entryFileNames`*

`String` the pattern to use for naming entry point output files within `dir` when code splitting. Defaults to `"[name].js"`.

#### output.chunkFileNames *`--chunkFileNames`*

`String` the pattern to use for naming shared chunks created when code-splitting. Defaults to `"[name]-[hash].js"`.

#### output.assetFileNames *`--assetFileNames`*

`String` the pattern to use for naming custom emitted assets to include in the build output when code-splitting. Defaults to `"assets/[name]-[hash][extname]"`.

#### manualChunks *`--manualChunks`*

`{ [chunkAlias: String]: String[] }` allows creating custom shared commmon chunks. Provides an alias for the chunk and the list of modules to include in that chunk. Modules are bundled into the chunk along with their dependencies. If a module is already in a previous chunk, then the chunk will reference it there. Modules defined into chunks this way are considered to be entry points that can execute independently to any parent importers.

#### inlineDynamicImports *`--inlineDynamicImports`*
`true` or `false` (defaults to `false)` - will inline dynamic imports instead of creating new chunks when code-splitting is enabled. Only possible if a single input is provided.

#### experimentalOptimizeChunks *`--experimentalOptimizeChunks`*

`true` or `false` (defaults to `false)` - experimental feature to optimize chunk groupings. When a large number of chunks are generated in code-splitting, this allows smaller chunks to group together as long as they are within the `chunkGroupingSize` limit. It results in unnecessary code being loaded in some cases in order to have a smaller number of chunks overall. Disabled by default as it may cause unwanted side effects when loading unexpected code.

#### chunkGroupingSize *`--chunkGroupingSize`*

`number` (defaults to 5000) - the total source length allowed to be loaded unnecessarily when applying chunk grouping optimizations.

#### experimentalPreserveModules *`--experimentalPreserveModules`*

Instead of creating as few chunks as possible, this mode will create separate chunks for all modules using the original module names as file names. Requires the `--dir` option. Tree-shaking will still be applied, suppressing files that are not used by the provided entry points or do not have side-effects when executed. This mode can be used to transform a file structure to a different module format.

### Watch options

These options only take effect when running Rollup with the `--watch` flag, or using `rollup.watch`.

#### watch.chokidar

A `Boolean` indicating that [chokidar](https://github.com/paulmillr/chokidar) should be used instead of the built-in `fs.watch`, or an `Object` of options that are passed through to chokidar.

You must install chokidar separately if you wish to use it.

#### watch.include

Limit the file-watching to certain files:

```js
// rollup.config.js
export default {
  ...,
  watch: {
    include: 'src/**'
  }
};
```

#### watch.exclude

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

#### watch.clearScreen

`true` or `false` (defaults to `true`) – whether to clear the screen when a rebuild is triggered.
