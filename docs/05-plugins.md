---
title: Plugins
---

### Plugins Overview

A Rollup plugin is an object with one or more of the [properties](guide/en#properties) and [hooks](guide/en#hooks) described below, and which follows our [conventions](guide/en#conventions). A plugin should be distributed as a packages which exports a function that can be called with plugin specific options and returns such an object.

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
Type: `string`

The name of the plugin, for use in error messages and warnings.

### Hooks

In addition to properties defining the identity of your plugin, you may also specify properties that correspond to available build hooks. Hooks can affect how a build is run, provide information about a build, or modify a build once complete. There are different kinds of hooks:

* `async`: The hook can also return a promise resolving to the same type of value; otherwise, the hook is marked as `sync`
* `first`: If several plugins implement this hook, the hooks are run sequentially until a hook returns a value other than `null` or `undefined`
* `sequential`: If this hook returns a promise, then other hooks of this kind will only be executed once this hook has resolved
* `parallel`: If this hook returns a promise, then other hooks of this kind will not wait for this hook to be resolved

#### `banner`
Type: `string | (() => string)`<br>
Kind: `async, parallel`

Cf. [`output.banner/output.footer`](guide/en#output-banner-output-footer).

#### `buildEnd`
Type: `(error?: Error) => void`<br>
Kind: `async, parallel`

Called when rollup has finished bundling, but before `generate` or `write` is called; you can also return a Promise. If an error occurred during the build, it is passed on to this hook.

#### `buildStart`
Type: `(options: InputOptions) => void`<br>
Kind: `async, parallel`

Called on each `rollup.rollup` build.

#### `footer`
Type: `string | (() => string)`<br>
Kind: `async, parallel`

Cf. [`output.banner/output.footer`](guide/en#output-banner-output-footer).

#### `generateBundle`
Type: `(options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }, isWrite: boolean) => void`<br>
Kind: `async, sequential`

Called at the end of `bundle.generate()` or immediately before the files are written in `bundle.write()`. To modify the files after they have been written, use the [`writeBundle`](guide/en#writebundle) hook. `bundle` provides the full list of files being written or generated along with their details:

```
// AssetInfo
{
  fileName: string,
  isAsset: true,
  source: string | Buffer
}

// ChunkInfo
{
  dynamicImports: string[],
  exports: string[],
  facadeModuleId: string | null,
  fileName: string,
  imports: string[],
  isDynamicEntry: boolean,
  isEntry: boolean,
  modules: {
    [id: string]: {
      renderedExports: string[],
      removedExports: string[],
      renderedLength: number,
      originalLength: number
    },
  },
  name: string
}
```

#### `intro`
Type: `string | (() => string)`<br>
Kind: `async, parallel`

Cf. [`output.intro/output.outro`](guide/en#output-intro-output-outro).

#### `load`
Type: `(id: string) => string | null | { code: string, map?: string | SourceMap }`<br>
Kind: `async, first`

Defines a custom loader. Returning `null` defers to other `load` functions (and eventually the default behavior of loading from the file system).

#### `options`
Type: `(options: InputOptions) => InputOptions | null`<br>
Kind: `sync, sequential`

Reads and replaces or manipulates the options object passed to `rollup.rollup`. Returning `null` does not replace anything. This is the only hook that does not have access to most [plugin context](guide/en#plugin-context) utility functions as it is run before rollup is fully configured.

#### `outputOptions`
Type: `(outputOptions: OutputOptions) => OutputOptions | null`<br>
Kind: `sync, sequential`

Reads and replaces or manipulates the output options object passed to `bundle.generate`. Returning `null` does not replace anything.

#### `outro`
Type: `string | (() => string)`<br>
Kind: `async, parallel`

Cf. [`output.intro/output.outro`](guide/en#output-intro-output-outro).

#### `renderChunk`
Type: `(code: string, chunk: ChunkInfo, options: OutputOptions) => string | { code: string, map: SourceMap } | null`<br>
Kind: `async, sequential`

Can be used to transform individual chunks. Called for each Rollup output chunk file. Returning `null` will apply no transformations.

#### `renderError`
Type: `(error: Error) => void`<br>
Kind: `async, parallel`

Called when rollup encounters an error during `bundle.generate()` or `bundle.write()`. The error is passed to this hook. To get notified when generation completes successfully, use the `generateBundle` hook.

#### `renderStart`
Type: `() => void`<br>
Kind: `async, parallel`

Called initially each time `bundle.generate()` or `bundle.write()` is called. To get notified when generation has completed, use the `generateBundle` and `renderError` hooks.

#### `resolveDynamicImport`
Type: `(specifier: string | ESTree.Node, importer: string) => string | false | null`<br>
Kind: `async, first`

Defines a custom resolver for dynamic imports. In case a dynamic import is not passed a string as argument, this hook gets access to the raw AST nodes to analyze. Returning `null` will defer to other resolvers and eventually to `resolveId` if this is possible; returning `false` signals that the import should be kept as it is and not be passed to other resolvers thus making it external. Note that the return value of this hook will not be passed to `resolveId` afterwards; if you need access to the static resolution algorithm, you can use `this.resolveId(importee, importer)` on the plugin context.

#### `resolveId`
Type: `(importee: string, importer: string) => string | false | null | {id: string, external?: boolean}`<br>
Kind: `async, first`

Defines a custom resolver. A resolver can be useful for e.g. locating third-party dependencies. Returning `null` defers to other `resolveId` functions (and eventually the default resolution behavior); returning `false` signals that `importee` should be treated as an external module and not included in the bundle.

If you return an object, then it is possible to resolve an import to a different id while excluding it from the bundle at the same time. This allows you to replace dependencies with external dependencies without the need for the user to mark them as "external" manually via the `external` option:

```js
resolveId(id) {
	if (id === 'my-dependency') {
		return {id: 'my-dependency-develop', external: true};
	}
	return null;
}
```

#### `transform`
Type: `(code: string, id: string) => string | { code: string, map?: string | SourceMap, ast? : ESTree.Program } | null`
<br>
Kind: `async, sequential`

Can be used to transform individual modules. Note that in watch mode, the result of this hook is cached when rebuilding and the hook is only triggered again for a module `id` if either the `code` of the module has changed or a file has changed that was added via `this.addWatchFile` the last time the hook was triggered for this module.

#### `watchChange`
Type: `(id: string) => void`<br>
Kind: `sync, sequential`

Notifies a plugin whenever rollup has detected a change to a monitored file in `--watch` mode.

#### `writeBundle`
Type: `( bundle: { [fileName: string]: AssetInfo | ChunkInfo }) => void`<br>
Kind: `async, parallel`

Called only at the end of `bundle.write()` once all files have been written. Similar to the [`generateBundle`](guide/en#generatebundle) hook, `bundle` provides the full list of files being written along with their details.

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

### Plugin Context

A number of utility functions and informational bits can be accessed from within most [hooks](guide/en#hooks) via `this`:

#### `this.addWatchFile(id: string) => void`

Adds additional files to be monitored in watch mode so that changes to these files will trigger rebuilds. `id` can be an absolute path to a file or directory or a path relative to the current working directory. This context function can only be used in hooks during the build phase, i.e. in `buildStart`, `load`, `resolveId`, and `transform`.

**Note:** Usually in watch mode to improve rebuild speed, the `transform` hook will only be triggered for a given module if its contents actually changed. Using `this.addWatchFile` from within the `transform` hook will make sure the `transform` hook is also reevaluated for this module if the watched file changes.

In general, it is recommended to use `this.addWatchfile` from within the hook that depends on the watched file.

#### `this.emitAsset(assetName: string, source: string) => string`

Emits a custom file to include in the build output, returning its `assetId`. You can defer setting the source if you provide it later via `this.setAssetSource(assetId, source)`. A string or Buffer source must be set for each asset through either method or an error will be thrown on generate completion.

#### `this.error(error: string | Error, position?: number) => void`

Structurally equivalent to `this.warn`, except that it will also abort the bundling process.

#### `this.getAssetFileName(assetId: string) => string`

Get the file name of an asset, according to the `assetFileNames` output option pattern.

#### `this.getModuleInfo(moduleId: string) => ModuleInfo`

Returns additional information about the module in question in the form

```js
{
  id, // the id of the module, for convenience
  isExternal, // for external modules that are not included in the graph
  importedIds // the module ids imported by this module
}
```

If the module id cannot be found, an error is thrown.

#### `this.isExternal(id: string, parentId: string, isResolved: boolean): boolean`

Determine if a given module ID is external.

#### `this.meta: {rollupVersion: string}`

An `Object` containing potentially useful Rollup metadata. `meta` is the only context property accessible from the [`options`](guide/en#options) hook.

#### `this.moduleIds: IterableIterator<string>`

An `Iterator` that gives access to all module ids in the current graph. It can be iterated via

```js
for (const moduleId of this.moduleIds) { /* ... */ }
```

or converted into an Array via `Array.from(this.moduleIds)`.

#### `this.parse(code: string, acornOptions: AcornOptions) => ESTree.Program`

Use Rollup's internal acorn instance to parse code to an AST.

#### `this.resolveId(importee: string, importer: string) => string`

Resolve imports to module ids (i.e. file names). Uses the same hooks as Rollup itself.

#### `this.setAssetSource(assetId: string, source: string | Buffer) => void`

Set the deferred source of an asset.

#### `this.warn(warning: string | RollupWarning, position?: number )`

Using this method will queue warnings for a build. These warnings will be printed by the CLI just like internally-generated warnings (except with the plugin name), or captured by custom `onwarn` handlers.

The `warning` argument can be a `string` or an object with (at minimum) a `message` property:

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
