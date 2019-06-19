---
title: Big list of options
---

### Core functionality

#### external
Type: `string[] | (id: string, parentId: string, isResolved: boolean) => boolean`<br>
CLI: `-e`/`--external <external-id,another-external-id,...>`

Either a function that takes an `id` and returns `true` (external) or `false` (not external), or an `Array` of module IDs that should remain external to the bundle. The IDs should be either:

1. the name of an external dependency, exactly the way it is written in the import statement. I.e. to mark `import "dependency.js"` as external, use `"dependency.js"` while to mark `import "dependency"` as external, use `"dependency"`.
2. a resolved ID (like an absolute path to a file).

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
Type: `string | string [] | { [entryName: string]: string }`<br>
CLI: `-i`/`--input <filename>`

The bundle's entry point(s) (e.g. your `main.js` or `app.js` or `index.js`). If you provide an array of entry points or an object mapping names to entry points, they will be bundled to separate output chunks. Unless the [`output.file`](guide/en#output-file) option is used, generated chunk names will follow the [`output.entryFileNames`](guide/en#output-entryfilenames) option. When using the object form, the `[name]` portion of the file name will be the name of the object property while for the array form, it will be the file name of the entry point.

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

When using the command line interface, multiple inputs can be provided by using the option multiple times. When provided as the first options, it is equivalent to not prefix them with `--input`:

```sh
rollup --format esm --input src/entry1.js --input src/entry2.js
# is equivalent to
rollup src/entry1.js src/entry2.js --format esm
```

Chunks can be named by adding an `=` to the provided value:

```sh
rollup main=src/entry1.js other=src/entry2.js --format esm
```

File names containing spaces can be specified by using quotes:

```sh
rollup "main entry"="src/entry 1.js" "src/other entry.js" --format esm
```

#### output.dir
Type: `string`<br>
CLI: `-d`/`--dir <dirname>`

The directory in which all generated chunks are placed. This option is required if more than one chunk is generated. Otherwise, the `file` option can be used instead.

#### output.file
Type: `string`<br>
CLI: `-o`/`--file <filename>`

The file to write to. Will also be used to generate sourcemaps, if applicable. Can only be used if not more than one chunk is generated.

#### output.format
Type: `string`<br>
CLI: `-f`/`--format <formatspecifier>`

Specifies the format of the generated bundle. One of the following:

* `amd` – Asynchronous Module Definition, used with module loaders like RequireJS
* `cjs` – CommonJS, suitable for Node and other bundlers
* `esm` – Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a `<script type=module>` tag in modern browsers
* `iife` – A self-executing function, suitable for inclusion as a `<script>` tag. (If you want to create a bundle for your application, you probably want to use this.)
* `umd` – Universal Module Definition, works as `amd`, `cjs` and `iife` all in one
* `system` – Native format of the SystemJS loader

#### output.globals
Type: `{ [id: string]: string } | ((id: string) => string)`<br>
CLI: `-g`/`--globals <external-id:variableName,another-external-id:anotherVariableName,...>`

Specifies `id: variableName` pairs necessary for external imports in `umd`/`iife` bundles. For example, in a case like this...

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
Type: `string`<br>
CLI: `-n`/`--name <variableName>`

Necessary for `iife`/`umd` bundles that exports values in which case it is the global variable name  representing your bundle. Other scripts on the same page can use this variable name to access the exports of your bundle.

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
$ rollup -n "a.b.c"

/* ->
this.a = this.a || {};
this.a.b = this.a.b || {};
this.a.b.c = ...
*/
```

#### plugins
Type: `Plugin | (Plugin | void)[]`

See [Using plugins](guide/en#using-plugins) for more information on how to use plugins and [Plugins](guide/en#plugins) on how to write your own (try it out, it's not as difficult as it may sound and very much extends what you can do with Rollup!). For plugins imported from packages, remember to call the imported plugin function (i.e. `commonjs()`, not just `commonjs`). Falsy plugins will be ignored, which can be used to easily activate or deactivate plugins.

```js
// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const isProduction = process.env.NODE_ENV === 'production';

export default (async () => ({
  entry: 'main.js',
  plugins: [
    resolve(),
    commonjs(),
    isProduction && (await import('rollup-plugin-terser')).terser()
  ]
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

#### inlineDynamicImports
Type: `boolean`<br>
CLI: `--inlineDynamicImports`/`--no-inlineDynamicImports`
Default: `false`

This will inline dynamic imports instead of creating new chunks to create a single bundle. Only possible if a single input is provided.

#### manualChunks
Type: `{ [chunkAlias: string]: string[] } | ((id: string) => string | void)`

Allows the creation of custom shared common chunks. When using the object form, each property represents a chunk that contains the listed modules and all their dependencies if they are part of the module graph unless they are already in another manual chunk. The name of the chunk will be determined by the property key.

Note that it is not necessary for the listed modules themselves to be be part of the module graph, which is useful if you are working with `rollup-plugin-node-resolve` and use deep imports from packages. For instance

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

Be aware that manual chunks can change the behaviour of the application if side-effects are triggered before the corresponding modules are actually used.

#### onwarn
Type: `(warning: RollupWarning, defaultHandler: (warning: string | RollupWarning) => void) => void;`

A function that will intercept warning messages. If not supplied, warnings will be deduplicated and printed to the console.

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
Type: `string`<br>
CLI: `--assetFileNames <pattern>`<br>
Default: `"assets/[name]-[hash][extname]"`

The pattern to use for naming custom emitted assets to include in the build output. Pattern supports the following placeholders:
 * `[extname]`: The file extension of the asset including a leading dot, e.g. `.css`.
 * `[ext]`: The file extension without a leading dot, e.g. `css`.
 * `[hash]`: A hash based on the name and content of the asset.
 * `[name]`: The file name of the asset excluding any extension.

Forward slashes `/` can be used to place files in sub-directories. See also `[`output.chunkFileNames`](guide/en#output-chunkfilenames)`, [`output.entryFileNames`](guide/en#output-entryfilenames).

#### output.banner/output.footer
Type: `string | (() => string | Promise<string>)`<br>
CLI: `--banner`/`--footer <text>`

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

See also [`output.intro/output.outro`](guide/en#output-intro-output-outro).

#### output.chunkFileNames
Type: `string`<br>
CLI: `--chunkFileNames <pattern>`<br>
Default: `"[name]-[hash].js"`

The pattern to use for naming shared chunks created when code-splitting. Pattern supports the following placeholders:
 * `[format]`: The rendering format defined in the output options, e.g. `esm` or `cjs`.
 * `[hash]`: A hash based on the content of the chunk and the content of all its dependencies.
 * `[name]`: The name of the chunk. This will be `chunk` unless the chunk was created via the [`manualChunks`](guide/en#manualchunks) options.

Forward slashes `/` can be used to place files in sub-directories. See also [`output.assetFileNames`](guide/en#output-assetfilenames), [`output.entryFileNames`](guide/en#output-entryfilenames).

#### output.compact
Type: `boolean`<br>
CLI: `--compact`/`--no-compact`
Default: `false`

This will minify the wrapper code generated by rollup. Note that this does not affect code written by the user. This option is useful when bundling pre-minified code.

#### output.entryFileNames
Type: `string`<br>
CLI: `--entryFileNames <pattern>`<br>
Default: `"[name].js"`

The pattern to use for chunks created from entry points. Pattern supports the following placeholders:
* `[format]`: The rendering format defined in the output options, e.g. `esm` or `cjs`.
* `[hash]`: A hash based on the content of the entry point and the content of all its dependencies.
* `[name]`: The file name (without extension) of the entry point.

Forward slashes `/` can be used to place files in sub-directories. See also [`output.assetFileNames`](guide/en#output-assetfilenames), [`output.chunkFileNames`](guide/en#output-chunkfilenames).

#### output.extend
Type: `boolean`<br>
CLI: `--extend`/`--no-extend`<br>
Default: `false`

Whether or not to extend the global variable defined by the `name` option in `umd` or `iife` formats. When `true`, the global variable will be defined as `(global.name = global.name || {})`. When false, the global defined by `name` will be overwritten like `(global.name = {})`.

#### output.interop
Type: `boolean`<br>
CLI: `--interop`/`--no-interop`<br>
Default: `true`

Whether or not to add an 'interop block'. By default (`interop: true`), for safety's sake, Rollup will assign any external dependencies' `default` exports to a separate variable if it is necessary to distinguish between default and named exports. This generally only applies if your external dependencies were transpiled (for example with Babel) – if you are sure you do not need it, you can save a few bytes with `interop: false`.

#### output.intro/output.outro
Type: `string | (() => string | Promise<string>)`<br>
CLI: `--intro`/`--outro <text>`

Similar to [`output.banner/output.footer`](guide/en#output-banner-output-footer), except that the code goes *inside* any format-specific wrapper.

```js
export default {
  ...,
  output: {
    ...,
    intro: 'const ENVIRONMENT = "production";'
  }
};
```

#### output.paths
Type: `{ [id: string]: string } | ((id: string) => string)`

Maps ids to paths. Where supplied, these paths will be used in the generated bundle instead of the module ID, allowing you to, for example, load dependencies from a CDN:

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

#### output.sourcemap
Type: `boolean | 'inline'`<br>
CLI: `-m`/`--sourcemap`/`--no-sourcemap`<br>
Default: `false`

If `true`, a separate sourcemap file will be created. If `inline`, the sourcemap will be appended to the resulting `output` file as a data URI.

#### output.sourcemapExcludeSources
Type: `boolean`<br>
CLI: `--sourcemapExcludeSources`/`--no-sourcemapExcludeSources`<br>
Default: `false`

If `true`, the actual code of the sources will not be added to the sourcemaps making them considerably smaller.

#### output.sourcemapFile
Type: `string`<br>
CLI: `--sourcemapFile <file-name-with-path>`

The location of the generated bundle. If this is an absolute path, all the `sources` paths in the sourcemap will be relative to it. The `map.file` property is the basename of `sourcemapFile`, as the location of the sourcemap is assumed to be adjacent to the bundle.

`sourcemapFile` is not required if `output` is specified, in which case an output filename will be inferred by adding ".map"  to the output filename for the bundle.

#### output.sourcemapPathTransform
Type: `(sourcePath: string) => string`

A transformation to apply to each path in a sourcemap. For instance the following will change all paths to be relative to the `src` directory.

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

#### preserveModules
Type: `boolean`<br>
CLI: `--preserveModules`/`--no-preserveModules`<br>
Default: `false`

Instead of creating as few chunks as possible, this mode will create separate chunks for all modules using the original module names as file names. Requires the [`output.dir`](guide/en#output-dir) option. Tree-shaking will still be applied, suppressing files that are not used by the provided entry points or do not have side-effects when executed. This mode can be used to transform a file structure to a different module format.

#### strictDeprecations
Type: `boolean`<br>
CLI: `--strictDeprecations`/`--no-strictDeprecations`<br>
Default: `false`

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
    acornInjectPlugins: [
        jsx()
    ]
};
```

in your rollup configuration. Note that this is different from using Babel in that the generated output will still contain JSX while Babel will replace it with valid JavaScript.

#### context
Type: `string`<br>
CLI: `--context <contextVariable>`<br>
Default: `undefined`

By default, the context of a module – i.e., the value of `this` at the top level – is `undefined`. In rare cases you might need to change this to something else, like `'window'`.

#### moduleContext
Type: `((id: string) => string) | { [id: string]: string }`<br>

Same as [`context`](guide/en#context), but per-module – can either be an object of `id: context` pairs, or an `id => context` function.

#### output.amd
Type: `{ id?: string, define?: string}`

An object that can contain the following properties:

**output.amd.id**<br>
Type: `string`<br>
CLI: `--amd.id <amdId>`

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

**output.amd.define**<br>
Type: `string`<br>
CLI: `--amd.define <defineFunctionName>`

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
Type: `boolean`<br>
CLI: `--esModule`/`--no-esModule`
Default: `true`

Whether or not to add a `__esModule: true` property when generating exports for non-ESM formats.

#### output.exports
Type: `string`<br>
CLI: `--exports <exportMode>`<br>
Default: `'auto'`

What export mode to use. Defaults to `auto`, which guesses your intentions based on what the `input` module exports:

* `default` – suitable if you are only exporting one thing using `export default ...`
* `named` – suitable if you are exporting more than one thing
* `none` – suitable if you are not exporting anything (e.g. you are building an app, not a library)

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
const yourLib = require( 'your-lib' ).default;
```

#### output.freeze
Type: `boolean`<br>
CLI: `--freeze`/`--no-freeze`<br>
Default: `true`

Whether to `Object.freeze()` namespace import objects (i.e. `import * as namespaceImportObject from...`) that are accessed dynamically.

#### output.indent
Type: `boolean | string`<br>
CLI: `--indent`/`--no-indent`<br>
Default: `true`

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
Type: `boolean`<br>
CLI: `--namespaceToStringTag`/`--no-namespaceToStringTag`<br>
Default: `false`

Whether to add spec compliant `.toString()` tags to namespace objects. If this option is set,

```javascript
import * as namespace from './file.js';
console.log(String(namespace));
```

will always log `[object Module]`;

#### output.noConflict
Type: `boolean`<br>
CLI: `--noConflict`/`--no-noConflict`<br>
Default: `false`

This will generate an additional `noConflict` export to UMD bundles. When called in an IIFE scenario, this method will return the bundle exports while restoring the corresponding global variable to its previous value.

#### output.preferConst
Type: `boolean`<br>
CLI: `--preferConst`/`--no-preferConst`<br>
Default: `false`

Generate `const` declarations for exports rather than `var` declarations.

#### output.strict
Type: `boolean`<br>
CLI: `--strict`/`--no-strict`<br>
Default: `true`

Whether to include the 'use strict' pragma at the top of generated non-ESM bundles. Strictly-speaking, ES modules are *always* in strict mode, so you shouldn't disable this without good reason.

#### output.dynamicImportFunction
Type: `string`<br>
CLI: `--dynamicImportFunction <name>`<br>
Default: `import`

This will rename the dynamic import function to the chosen name when outputting ESM bundles. This is useful for generating code that uses a dynamic import polyfill such as [this one](https://github.com/uupaa/dynamic-import-polyfill).

#### preserveSymlinks
Type: `boolean`<br>
CLI: `--preserveSymlinks`<br>
Default: `false`

When set to `false`, symbolic links are followed when resolving a file. When set to `true`, instead of being followed, symbolic links are treated as if the file is where the link is. To illustrate, consider the following situation:

```js
// /main.js
import {x} from './linked.js';
console.log(x);

// /linked.js
// this is a symbolic link to /nested/file.js

// /nested/file.js
export {x} from './dep.js';

// /dep.js
export const x = 'next to linked';

// /nested/dep.js
export const x = 'next to original';
```

If `preserveSymlinks` is `false`, then the bundle created from `/main.js` will log "next to original" as it will use the location of the symbolically linked file to resolve its dependencies. If `preserveSymlinks` is `true`, however, it will log "next to linked" as the symbolic link will not be resolved.

#### shimMissingExports
Type: `boolean`<br>
CLI: `--shimMissingExports`/`--no-shimMissingExports`<br>
Default: `false`

If this option is provided, bundling will not fail if bindings are imported from a file that does not define these bindings. Instead, new variables will be created for these bindings with the value `undefined`.

#### treeshake
Type: `boolean | { annotations?: boolean, moduleSideEffects?: ModuleSideEffectsOption, propertyReadSideEffects?: boolean }`<br>
CLI: `--treeshake`/`--no-treeshake`<br>
Default: `true`

Whether or not to apply tree-shaking and to fine-tune the tree-shaking process. Setting this option to `false` will produce bigger bundles but may improve build performance. If you discover a bug caused by the tree-shaking algorithm, please file an issue!
Setting this option to an object implies tree-shaking is enabled and grants the following additional options:

**treeshake.annotations**<br>
Type: `boolean`<br>
CLI: `--treeshake.annotations`/`--no-treeshake.annotations`<br>
Default: `true`

If `false`, ignore hints from pure annotations, i.e. comments containing `@__PURE__` or `#__PURE__`, when determining side-effects of function calls and constructor invocations. These annotations need to immediately precede the call invocation to take effect. The following code will be completely removed unless this option is set to `false`, in which case it will remain unchanged.

```javascript
/*@__PURE__*/console.log('side-effect');

class Impure {
  constructor() {
    console.log('side-effect')
  }
}

/*@__PURE__*/new Impure();
```

**treeshake.moduleSideEffects**<br>
Type: `boolean | "no-external" | string[] | (id: string, external: boolean) => boolean`<br>
CLI: `--treeshake.moduleSideEffects`/`--no-treeshake.moduleSideEffects`<br>
Default: `true`

If `false`, assume modules and external dependencies from which nothing is imported do not have other side-effects like mutating global variables or logging without checking. For external dependencies, this will suppress empty imports:

```javascript
// input file
import {unused} from 'external-a';
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
import {unused} from './b.js';
console.log(42);

// input file b.js
console.log('side-effect');
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

You can also supply a list of modules with side-effects or a function to determine it for each module individually. The value `"no-external"` will only remove external imports if possible and is equivalent to the function `(id, external) => !external`;

**treeshake.propertyReadSideEffects**
Type: `boolean`<br>
CLI: `--treeshake.propertyReadSideEffects`/`--no-treeshake.propertyReadSideEffects`<br>
Default: `true`

If `false`, assume reading a property of an object never has side-effects. Depending on your code, disabling this option can significantly reduce bundle size but can potentially break functionality if you rely on getters or errors from illegal property access.

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

**treeshake.tryCatchDeoptimization**
Type: `boolean`<br>
CLI: `--treeshake.tryCatchDeoptimization`/`--no-treeshake.tryCatchDeoptimization`<br>
Default: `true`

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
  Object.create(null)
});

// call will be retained but again, otherFn is not deoptimized
test(otherFn);

```

### Experimental options

These options reflect new features that have not yet been fully finalized. Availability, behaviour and usage may therefore be subject to change between minor versions.

#### chunkGroupingSize
Type: `number`<br>
CLI: `--chunkGroupingSize <size>`<br>
Default: `5000`

The total source length allowed to be loaded unnecessarily when using `experimentalOptimizeChunks`.

#### experimentalCacheExpiry
Type: `number`<br>
CLI: `--experimentalCacheExpiry <numberOfRuns>`<br>
Default: `10`

Determines after how many runs cached assets that are no longer used by plugins should be removed.

#### experimentalOptimizeChunks
Type: `boolean`<br>
CLI: `--experimentalOptimizeChunks`/`--no-experimentalOptimizeChunks`<br>
Default: `false`

Experimental feature to optimize chunk groupings. When a large number of chunks are generated, this allows smaller chunks to group together as long as they are within the `chunkGroupingSize` limit. It results in unnecessary code being loaded in some cases in order to have a smaller number of chunks overall. Disabled by default as it may cause unwanted side effects when loading unexpected code.

#### experimentalTopLevelAwait
Type: `boolean`<br>
CLI: `--experimentalTopLevelAwait`/`--no-experimentalTopLevelAwait`<br>
Default: `false`

Whether to support top-level await statements. The generated code will follow [Variant A of the specification](https://github.com/tc39/proposal-top-level-await#variant-a-top-level-await-blocks-tree-execution).

#### perf
Type: `boolean`<br>
CLI: `--perf`/`--no-perf`<br>
Default: `false`

Whether to collect performance timings. When used from the command line or a configuration file, detailed measurements about the current bundling process will be displayed. When used from the [JavaScript API](guide/en#javascript-api), the returned bundle object will contain an aditional `getTimings()` function that can be called at any time to retrieve all accumulated measurements.

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

### Watch options

These options only take effect when running Rollup with the `--watch` flag, or using `rollup.watch`.

#### watch.chokidar
Type: `boolean | ChokidarOptions`<br>
CLI: `--watch.chokidar`/`--no-watch.chokidar`<br>
Default: `false`

A `Boolean` indicating that [chokidar](https://github.com/paulmillr/chokidar) should be used instead of the built-in `fs.watch`, or an `Object` of options that are passed through to chokidar.

You must install chokidar separately if you wish to use it.

#### watch.clearScreen
Type: `boolean`<br>
CLI: `--watch.clearScreen`/`--no-watch.clearScreen`<br>
Default: `true`

Whether to clear the screen when a rebuild is triggered.

#### watch.exclude
Type: `string`<br>
CLI: `--watch.exclude <excludedPattern>`

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
Type: `string`<br>
CLI: `--watch.include <includedPattern>`

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

### Deprecated options

☢️ These options have been deprecated and may be removed in a future Rollup version.

#### treeshake.pureExternalModules
Type: `boolean | string[] | (id: string) => boolean | null`<br>
CLI: `--treeshake.pureExternalModules`/`--no-treeshake.pureExternalModules`<br>
Default: `false`

If `true`, assume external dependencies from which nothing is imported do not have other side-effects like mutating global variables or logging.

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

You can also supply a list of external ids to be considered pure or a function that is called whenever an external import could be removed.
