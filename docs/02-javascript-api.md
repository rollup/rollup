---
title: JavaScript API
---

Rollup provides a JavaScript API which is usable from Node.js. You will rarely need to use this, and should probably be using the command line API unless you are extending Rollup itself or using it for something esoteric, such as generating bundles programmatically.

### rollup.rollup

The `rollup.rollup` function returns a Promise that resolves to a `bundle` object with various properties and methods shown here:

```javascript
const rollup = require('rollup');

// see below for details on the options
const inputOptions = {...};
const outputOptions = {...};

async function build() {
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  console.log(bundle.imports); // an array of external dependencies
  console.log(bundle.exports); // an array of names exported by the entry point
  console.log(bundle.modules); // an array of module objects

  // generate code and a sourcemap
  const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);
}

build();
```


#### inputOptions

The `inputOptions` object can contain the following properties (see the [big list of options](guide/en#big-list-of-options) for full details on these):

```js
const inputOptions = {
  // core options
  input, // the only required option
  external,
  plugins,

  // advanced options
  onwarn,
  cache,
  perf,

  // danger zone
  acorn,
  acornInjectPlugins,
  treeshake,
  context,
  moduleContext,

  // experimental
  experimentalCodeSplitting,
  manualChunks,
  optimizeChunks,
  chunkGroupingSize
};
```


#### outputOptions

The `outputOptions` object can contain the following properties (see the [big list of options](guide/en#big-list-of-options) for full details on these):

```js
const outputOptions = {
  // core options
  format, // required
  file,
  dir,
  name,
  globals,

  // advanced options
  paths,
  banner,
  footer,
  intro,
  outro,
  sourcemap,
  sourcemapFile,
  sourcemapPathTransform,
  interop,
  extend,

  // danger zone
  exports,
  amd,
  indent,
  strict,
  freeze,
  namespaceToStringTag,

  // experimental
  entryFileNames,
  chunkFileNames,
  assetFileNames
};
```


### rollup.watch

Rollup also provides a `rollup.watch` function that rebuilds your bundle when it detects that the individual modules have changed on disk. It is used internally when you run Rollup from the command line with the `--watch` flag.

```js
const rollup = require('rollup');

const watchOptions = {...};
const watcher = rollup.watch(watchOptions);

watcher.on('event', event => {
  // event.code can be one of:
  //   START        — the watcher is (re)starting
  //   BUNDLE_START — building an individual bundle
  //   BUNDLE_END   — finished building a bundle
  //   END          — finished building all bundles
  //   ERROR        — encountered an error while bundling
  //   FATAL        — encountered an unrecoverable error
});

// stop watching
watcher.close();
```

#### watchOptions

The `watchOptions` argument is a config (or an array of configs) that you would export from a config file.

```js
const watchOptions = {
  ...inputOptions,
  output: [outputOptions],
  watch: {
    chokidar,
    include,
    exclude,
    clearScreen
  }
};
```

See above for details on `inputOptions` and `outputOptions`, or consult the [big list of options](guide/en#big-list-of-options) for info on `chokidar`, `include` and `exclude`.


### TypeScript Declarations

If you'd like to use the API in a TypeScript environment you can do so, as now we ship TypeScript declarations.

You need to install some dependencies in case you have [skipLibCheck](https://www.typescriptlang.org/docs/handbook/compiler-options.html) turned off.

```console
npm install @types/acorn @types/chokidar source-map magic-string --only=dev
```
