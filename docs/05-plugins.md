---
title: Plugins
---

### Plugins Overview

A Rollup plugin is a package which exports a function that returns an object with one or more of the [properties](guide/en#properties) and [hooks](guide/en#hooks) described below, and which follows our [conventions](guide/en#conventions).

Plugins allow you to customise Rollup's behaviour by, for example, transpiling code before bundling, or finding third-party modules in your `node_modules` folder. For an example on how to use them, see [Using plugins](guide/en#using-plugins).

A List of Plugins may be found at https://github.com/rollup/awesome. If you would like to make a suggestion for a plugin, please submit a Pull Request.

### A Simple Example

The following plugin will intercept any imports of `virtual-module` without accessing the file system. This is for instance necessary if you want to use Rollup in a browser. It can even be used to replace entry points as shown in the example.

```js
// rollup-plugin-my-example.js
export default function myExample () {
  return {
    name: 'my-example', // this name will show up in warnings and errors
    resolveId ( importee ) {
      if (importee === 'virtual-module') {
        return importee; // this signals that rollup should not ask other plugins or check the file system to find this id
      }
      return null; // other ids should be handled as usually
    },
    load ( id ) {
      if (id === 'virtual-module') {
        return 'export default "This is virtual!"'; // the source code for "virtual-module"
      }
      return null; // other ids should be handled as usually
    }
  };
}

// rollup.config.js
import myExample from './rollup-plugin-my-example.js';
export default ({
  input: 'virtual-module', // resolved by our plugin
  plugins: [myExample()],
  output: [{
    file: 'bundle.js',
    format: 'esm'
  }]
});
```

### Conventions

- Plugins should have a clear name with `rollup-plugin-` prefix.
- Include `rollup-plugin` keyword in `package.json`.
- Plugins should be tested. We recommend [mocha](https://github.com/mochajs/mocha) or [ava](https://github.com/avajs/ava) which support promises out of the box.
- Use asynchronous methods when it is possible.
- Document your plugin in English.
- Make sure your plugin outputs correct source mappings if appropriate.
- If your plugin uses 'virtual modules' (e.g. for helper functions), prefix the module ID with `\0`. This prevents other plugins from trying to process it.

### Properties

#### `name`
Type: `String`

The name of the plugin, for use in error messages and warnings.

#### `banner`
Type: `String|Function`

A `String`, or a `Function` that returns a `String` or `Promise`.

#### `options`
Type: `Function`<br>
Signature: `( inputOptions ) => options`

Replaces or manipulates the options object passed to `rollup.rollup`. Returning `null` does not replace anything.

### Hooks

In addition to properties defining the identity of your plugin, you may also specify properties that correspond to available build hooks. Hooks can affect how a build is run, provide information about a build, or modify a build once complete.

#### `buildEnd`
Type: `Function`<br>
Signature: `( error ) => void`

Called when rollup has finished bundling, but before `generate` or `write` is called; you can also return a Promise. If an error occurred during the build, it is passed on to this hook.

#### `buildStart`
Type: `Function`<br>
Signature: `( ) => (void|Promise)`

Called on each `rollup.rollup` build.

#### `footer`
Type: `String|Function`

A `String`, or a `Function` that returns a `String` or `Promise`.

#### `generateBundle`
Type: `Function`<br>
Signature: `( outputOptions, bundle, isWrite ) => (void|Promise)`

Called at the end of `bundle.generate()` or `bundle.write()`. `bundle` provides the full list of files being written or generated along with their details.

#### `intro`
Type: `String|Function`

A `String`, or a `Function` that returns a `String` or `Promise`.

#### `load`
Type: `Function`<br>
Signature: `( id ) => (code | { code, map } | Promise)`

Defines a custom loader. Returning `null` defers to other `load` functions (and eventually the default behavior of loading from the file system).

#### `outro`
Type: `String|Function`

A `String`, or a `Function` that returns a `String` or `Promise`.

#### `renderChunk`
Type: `Function`<br>
Signature: `(code, { modules, exports, imports, fileName, isEntry }, outputOptions) => (code | { code, map} | Promise)`

Can be used to transform individual chunks. Called for each Rollup output chunk file. Returning `null` will apply no transformations.

#### `renderError`
Type: `Function`<br>
Signature: `( error ) => void`

Called when rollup encounters an error during `bundle.generate()` or `bundle.write()`. The error is passed to this hook. To get notified when generation completes successfully, use the `generateBundle` hook.

#### `renderStart`
Type: `Function`<br>
Signature: `( ) => (void|Promise)`

Called initially each time `bundle.generate()` or `bundle.write()` is called. To get notified when generation has completed, use the `generateBundle` and `renderError` hooks.

#### `resolveId`
Type: `Function`<br>
Signature: `( importee, importer ) => (id|Promise)`

Defines a custom resolver. A resolver loader can be useful for e.g. locating third-party dependencies. Returning `null` or `undefined` defers to other `resolveId` functions (and eventually the default resolution behavior); returning `false` signals that `importee` should be treated as an external module and not included in the bundle.

#### `transform`
Type: `Function`<br>
Signature: `( source, id ) => (code|{ code, map, dependencies }|Promise)`

Can be used to transform individual modules. In `--watch` mode, also watch for changes in any of the files or directories in the `dependencies` array.

#### `watchChange`
Type: `Function`<br>
Signature: `(file) => { }`

Notifies a plugin whenever rollup has detected a change to a monitored file in `--watch` mode.

### Deprecated

☢️ These hooks have been deprecated and may be removed in a future Rollup version.

- `ongenerate` - _**Use [`generateBundle`](guide/en#generatebundle)**_ - Function hook
called when `bundle.generate()` is being executed.

- `onwrite` - _**Use [`generateBundle`](guide/en#generatebundle)**_ - Function hook
called when `bundle.write()` is being executed, after the file has been written
to disk.

- `transformBundle` – _**Use [`renderChunk`](guide/en#renderchunk)**_ - A `( source, { format } ) =>
code` or `( source, { format } ) => { code, map }` bundle transformer function.

- `transformChunk` – _**Use [`renderChunk`](guide/en#renderchunk)**_ - A `( source, outputOptions,
chunk ) => code | { code, map}` chunk transformer function.

More properties may be supported in future, as and when they prove necessary.

### Context

A number of utility functions and informational bits can be accessed from within all [hooks](guide/en#hooks) via `this`:

#### `this.emitAsset( assetName, source )`

Emits a custom file to include in the build output, returning its `assetId`. You can defer setting the source if you provide it later via `this.setAssetSource(assetId)`. A string or Buffer source must be set for each asset through either method or an error will be thrown on generate completion.

#### `this.error( error [, position] )`

Structurally equivalent to `this.warn`, except that it will also abort the bundling process.

#### `this.getAssetFileName( assetId )`

Get the file name of an asset, according to the `assetFileNames` output option pattern.

####  `this.isExternal( id, parentId, isResolved )`

Determine if a given module ID is external.

#### `this.meta`

An `Object` containing potentially useful Rollup metadata. eg.
`this.meta.rollupVersion`

#### `this.parse( code, acornOptions )`

Use Rollup's internal acorn instance to parse code to an AST.

#### `this.resolveId(importee, importer)`

Resolve imports to module ids (i.e. file names). Uses the same hooks as Rollup itself.

#### `this.setAssetSource( assetId, source )`

Set the deferred source of an asset.

#### `this.warn( warning [, position] )`

Using this method will queue warnings for a build. These warnings will be printed by the CLI just like internally-generated warnings (except with the plugin name), or captured by custom `onwarn` handlers.

The `warning` argument can be a `String` or an `Object` with (at minimum) a `message` property:

```js
this.warn( 'hmm...' );
// is equivalent to
this.warn({ message: 'hmm...' });
```

Use the second form if you need to add additional properties to your warning object. Rollup will augment the warning object with a `plugin` property containing the plugin name, `code` (`PLUGIN_WARNING`) and `id` (the file being transformed) properties.

The `position` argument is a character index where the warning was raised. If present, Rollup will augment the warning object with `pos`, `loc` (a standard `{ file, line, column }` object) and `frame` (a snippet of code showing the error).

### Asset URLs

To reference an asset URL reference from within JS code, use the `import.meta.ROLLUP_ASSET_URL_[assetId]` replacement. The following example represents emitting a CSS file for a module that then exports a URL that is constructed to correctly point to the emitted file from the target runtime environment.


```js
load (id) {
  const assetId = this.emitAsset('style.css', fs.readFileSync(path.resolve(assets, 'style.css')));
  return `export default import.meta.ROLLUP_ASSET_URL_${assetId}`;
}
```

### Advanced Loaders

The `load` hook can optionally return a `{ code, ast }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node.

### Transformers

Transformer plugins (i.e. those that return a `transform` function for e.g. transpiling non-JS files) should support `options.include` and `options.exclude`, both of which can be a minimatch pattern or an array of minimatch patterns. If `options.include` is omitted or of zero length, files should be included by default; otherwise they should only be included if the ID matches one of the patterns.

The `transform` hook, if returning an object, can also include an `ast` property. Only use this feature if you know what you're doing. Note that only the last AST in a chain of transforms will be used (and if there are transforms, any ASTs generated by the `load` hook will be discarded for the transformed modules.)

#### Example Transformer

(Use [rollup-pluginutils](https://github.com/rollup/rollup-pluginutils) for
commonly needed functions, and to implement a transformer in the recommended
manner.)

```js
import { createFilter } from 'rollup-pluginutils';

export default function myPlugin ( options = {} ) {
  const filter = createFilter( options.include, options.exclude );

  return {
    transform ( code, id ) {
      if ( !filter( id ) ) return;

      // proceed with the transformation...
      return {
        code: generatedCode,
        map: generatedSourceMap
      };
    }
  };
}
```

#### Source Code Transformations

If a plugin transforms source code, it should generate a sourcemap automatically, unless there's a specific `sourceMap: false` option. Rollup only cares about the `mappings` property (everything else is handled automatically). If it doesn't make sense to generate a sourcemap, (e.g. [rollup-plugin-string](https://github.com/TrySound/rollup-plugin-string)), return an empty sourcemap:

```js
return {
  code: transformedCode,
  map: { mappings: '' }
};
```

If the transformation does not move code, you can preserve existing sourcemaps
by returning `null`:

```js
return {
  code: transformedCode,
  map: null
};
```

If you create a plugin that you think would be useful to others, please publish
it to NPM and add submit it to https://github.com/rollup/awesome!
