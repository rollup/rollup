---
title: Plugin Development
---

### Plugins Overview

A Rollup plugin is an object with one or more of the [properties](guide/en/#properties) and [hooks](guide/en/#hooks) described below, and which follows our [conventions](guide/en/#conventions). A plugin should be distributed as a packages which exports a function that can be called with plugin specific options and returns such an object.

Plugins allow you to customise Rollup's behaviour by, for example, transpiling code before bundling, or finding third-party modules in your `node_modules` folder. For an example on how to use them, see [Using plugins](guide/en/#using-plugins).

A List of Plugins may be found at https://github.com/rollup/awesome. If you would like to make a suggestion for a plugin, please submit a Pull Request.

### A Simple Example

The following plugin will intercept any imports of `virtual-module` without accessing the file system. This is for instance necessary if you want to use Rollup in a browser. It can even be used to replace entry points as shown in the example.

```js
// rollup-plugin-my-example.js
export default function myExample () {
  return {
    name: 'my-example', // this name will show up in warnings and errors
    resolveId ( source ) {
      if (source === 'virtual-module') {
        return source; // this signals that rollup should not ask other plugins or check the file system to find this id
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

Cf. [`output.banner/output.footer`](guide/en/#outputbanneroutputfooter).

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

Cf. [`output.banner/output.footer`](guide/en/#outputbanneroutputfooter).

#### `generateBundle`
Type: `(options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }, isWrite: boolean) => void`<br>
Kind: `async, sequential`

Called at the end of `bundle.generate()` or immediately before the files are written in `bundle.write()`. To modify the files after they have been written, use the [`writeBundle`](guide/en/#writebundle) hook. `bundle` provides the full list of files being written or generated along with their details:

```
// AssetInfo
{
  fileName: string,
  isAsset: true,
  source: string | Buffer
}

// ChunkInfo
{
  code: string,
  dynamicImports: string[],
  exports: string[],
  facadeModuleId: string | null,
  fileName: string,
  imports: string[],
  isDynamicEntry: boolean,
  isEntry: boolean,
  map: SourceMap | null,
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

Cf. [`output.intro/output.outro`](guide/en/#outputintrooutputoutro).

#### `load`
Type: `(id: string) => string | null | { code: string, map?: string | SourceMap, ast? : ESTree.Program, moduleSideEffects?: boolean | null }`<br>
Kind: `async, first`

Defines a custom loader. Returning `null` defers to other `load` functions (and eventually the default behavior of loading from the file system). To prevent additional parsing overhead in case e.g. this hook already used `this.parse` to generate an AST for some reason, this hook can optionally return a `{ code, ast }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node.

If `false` is returned for `moduleSideEffects` and no other module imports anything from this module, then this module will not be included in the bundle without checking for actual side-effects inside the module. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side-effects (such as modifying a global or exported variable). If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the first `resolveId` hook that resolved this module, the `treeshake.moduleSideEffects` option, or eventually default to `true`. The `transform` hook can override this.

You can use [`this.getModuleInfo`](guide/en/#thisgetmoduleinfomoduleid-string--moduleinfo) to find out the previous value of `moduleSideEffects` inside this hook.

#### `options`
Type: `(options: InputOptions) => InputOptions | null`<br>
Kind: `sync, sequential`

Reads and replaces or manipulates the options object passed to `rollup.rollup`. Returning `null` does not replace anything. This is the only hook that does not have access to most [plugin context](guide/en/#plugin-context) utility functions as it is run before rollup is fully configured.

#### `outputOptions`
Type: `(outputOptions: OutputOptions) => OutputOptions | null`<br>
Kind: `sync, sequential`

Reads and replaces or manipulates the output options object passed to `bundle.generate`. Returning `null` does not replace anything.

#### `outro`
Type: `string | (() => string)`<br>
Kind: `async, parallel`

Cf. [`output.intro/output.outro`](guide/en/#outputintrooutputoutro).

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
Type: `(specifier: string | ESTree.Node, importer: string) => string | false | null | {id: string, external?: boolean}`<br>
Kind: `async, first`

Defines a custom resolver for dynamic imports. Returning `false` signals that the import should be kept as it is and not be passed to other resolvers thus making it external. Similar to the [`resolveId`](guide/en/#resolveid) hook, you can also return an object to resolve the import to a different id while marking it as external at the same time.

In case a dynamic import is passed a string as argument, a string returned from this hook will be interpreted as an existing module id while returning `null` will defer to other resolvers and eventually to `resolveId` .

In case a dynamic import is not passed a string as argument, this hook gets access to the raw AST nodes to analyze and behaves slightly different in the following ways:
- If all plugins return `null`, the import is treated as `external` without a warning.
- If a string is returned, this string is *not* interpreted as a module id but is instead used as a replacement for the import argument. It is the responsibility of the plugin to make sure the generated code is valid.
- To resolve such an import to an existing module, you can still return an object `{id, external}`.

Note that the return value of this hook will not be passed to `resolveId` afterwards; if you need access to the static resolution algorithm, you can use [`this.resolve(source, importer)`](guide/en/#thisresolvesource-string-importer-string-options-skipself-boolean--promiseid-string-external-boolean--null) on the plugin context.

#### `resolveFileUrl`
Type: `({assetReferenceId: string | null, chunkId: string, chunkReferenceId: string | null, fileName: string, format: string, moduleId: string, relativePath: string}) => string | null`<br>
Kind: `sync, first`

Allows to customize how Rollup resolves URLs of files that were emitted by plugins via `this.emitAsset` or `this.emitChunk`. By default, Rollup will generate code for `import.meta.ROLLUP_ASSET_URL_assetReferenceId` and `import.meta.ROLLUP_CHUNK_URL_chunkReferenceId` that should correctly generate absolute URLs of emitted files independent of the output format and the host system where the code is deployed.

For that, all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available. In case that fails or to generate more optimized code, this hook can be used to customize this behaviour. To do that, the following information is available:

- `assetReferenceId`: The asset reference id if we are resolving `import.meta.ROLLUP_ASSET_URL_assetReferenceId`, otherwise `null`.
- `chunkId`: The id of the chunk this file is referenced from.
- `chunkReferenceId`: The chunk reference id if we are resolving `import.meta.ROLLUP_CHUNK_URL_chunkReferenceId`, otherwise `null`.
- `fileName`: The path and file name of the emitted asset, relative to `output.dir` without a leading `./`.
- `format`: The rendered output format.
- `moduleId`: The id of the original module this file is referenced from. Useful for conditionally resolving certain assets differently.
- `relativePath`: The path and file name of the emitted file, relative to the chunk the file is referenced from. This will path will contain no leading `./` but may contain a leading `../`.

Note that since this hook has access to the filename of the current chunk, its return value will not be considered when generating the hash of this chunk.

The following plugin will always resolve all files relative to the current document:

```javascript
// rollup.config.js
resolveFileUrl({fileName}) {
  return `new URL('${fileName}', document.baseURI).href`;
}
```

#### `resolveId`
Type: `(source: string, importer: string) => string | false | null | {id: string, external?: boolean, moduleSideEffects?: boolean | null}`<br>
Kind: `async, first`

Defines a custom resolver. A resolver can be useful for e.g. locating third-party dependencies. Returning `null` defers to other `resolveId` functions and eventually the default resolution behavior; returning `false` signals that `source` should be treated as an external module and not included in the bundle. If this happens for a relative import, the id will be renormalized the same way as when the `external` option is used.

If you return an object, then it is possible to resolve an import to a different id while excluding it from the bundle at the same time. This allows you to replace dependencies with external dependencies without the need for the user to mark them as "external" manually via the `external` option:

```js
resolveId(source) {
  if (source === 'my-dependency') {
    return {id: 'my-dependency-develop', external: true};
  }
  return null;
}
```

Relative ids, i.e. starting with `./` or `../`, will **not** be renormalized when returning an object. If you want this behaviour, return an absolute file system location as `id` instead.

If `false` is returned for `moduleSideEffects` in the first hook that resolves a module id and no other module imports anything from this module, then this module will not be included without checking for actual side-effects inside the module. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side-effects (such as modifying a global or exported variable). If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the `treeshake.moduleSideEffects` option or default to `true`. The `load` and `transform` hooks can override this.

#### `resolveImportMeta`
Type: `(property: string | null, {chunkId: string, moduleId: string, format: string}) => string | null`<br>
Kind: `sync, first`

Allows to customize how Rollup handles `import.meta` and `import.meta.someProperty`, in particular `import.meta.url`. In ES modules, `import.meta` is an object and `import.meta.url` contains the URL of the current module, e.g. `http://server.net/bundle.js` for browsers or `file:///path/to/bundle.js` in Node.

By default for formats other than ES modules, Rollup replaces `import.meta.url` with code that attempts to match this behaviour by returning the dynamic URL of the current chunk. Note that all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available. For other properties, `import.meta.someProperty` is replaced with `undefined` while `import.meta` is replaced with an object containing a `url` property.
 
 This behaviour can be changed—also for ES modules—via this hook. For each occurrence of `import.meta<.someProperty>`, this hook is called with the name of the property or `null` if `import.meta` is accessed directly. For example, the following code will resolve `import.meta.url` using the relative path of the original module to the current working directory and again resolve this path against the base URL of the current document at runtime:

```javascript
// rollup.config.js
resolveImportMeta(property, {moduleId}) {
  if (property === 'url') {
    return `new URL('${path.relative(process.cwd(), moduleId)}', document.baseURI).href`;
  }
  return null;
}
```

Note that since this hook has access to the filename of the current chunk, its return value will not be considered when generating the hash of this chunk.

#### `transform`
Type: `(code: string, id: string) => string | null | { code: string, map?: string | SourceMap, ast? : ESTree.Program, moduleSideEffects?: boolean | null }`<br>
Kind: `async, sequential`

Can be used to transform individual modules. To prevent additional parsing overhead in case e.g. this hook already used `this.parse` to generate an AST for some reason, this hook can optionally return a `{ code, ast }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node.

Note that in watch mode, the result of this hook is cached when rebuilding and the hook is only triggered again for a module `id` if either the `code` of the module has changed or a file has changed that was added via `this.addWatchFile` the last time the hook was triggered for this module.

If `false` is returned for `moduleSideEffects` and no other module imports anything from this module, then this module will not be included without checking for actual side-effects inside the module. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side-effects (such as modifying a global or exported variable). If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the first `resolveId` hook that resolved this module, the `treeshake.moduleSideEffects` option, or eventually default to `true`.

You can use [`this.getModuleInfo`](guide/en/#thisgetmoduleinfomoduleid-string--moduleinfo) to find out the previous value of `moduleSideEffects` inside this hook.

#### `watchChange`
Type: `(id: string) => void`<br>
Kind: `sync, sequential`

Notifies a plugin whenever rollup has detected a change to a monitored file in `--watch` mode.

#### `writeBundle`
Type: `( bundle: { [fileName: string]: AssetInfo | ChunkInfo }) => void`<br>
Kind: `async, parallel`

Called only at the end of `bundle.write()` once all files have been written. Similar to the [`generateBundle`](guide/en/#generatebundle) hook, `bundle` provides the full list of files being written along with their details.

### Deprecated Hooks

☢️ These hooks have been deprecated and may be removed in a future Rollup version.

- `ongenerate` - _**Use [`generateBundle`](guide/en/#generatebundle)**_ - Function hook
called when `bundle.generate()` is being executed.

- `onwrite` - _**Use [`generateBundle`](guide/en/#generatebundle)**_ - Function hook
called when `bundle.write()` is being executed, after the file has been written
to disk.

- `resolveAssetUrl` - _**Use [`resolveFileUrl`](guide/en/#resolvefileurl)**_ - Function hook that allows to customize the generated code for asset URLs.

- `transformBundle` – _**Use [`renderChunk`](guide/en/#renderchunk)**_ - A `( source, { format } ) =>
code` or `( source, { format } ) => { code, map }` bundle transformer function.

- `transformChunk` – _**Use [`renderChunk`](guide/en/#renderchunk)**_ - A `( source, outputOptions,
chunk ) => code | { code, map}` chunk transformer function.

More properties may be supported in future, as and when they prove necessary.

### Plugin Context

A number of utility functions and informational bits can be accessed from within most [hooks](guide/en/#hooks) via `this`:

#### `this.addWatchFile(id: string) => void`

Adds additional files to be monitored in watch mode so that changes to these files will trigger rebuilds. `id` can be an absolute path to a file or directory or a path relative to the current working directory. This context function can only be used in hooks during the build phase, i.e. in `buildStart`, `load`, `resolveId`, and `transform`.

**Note:** Usually in watch mode to improve rebuild speed, the `transform` hook will only be triggered for a given module if its contents actually changed. Using `this.addWatchFile` from within the `transform` hook will make sure the `transform` hook is also reevaluated for this module if the watched file changes.

In general, it is recommended to use `this.addWatchfile` from within the hook that depends on the watched file.

#### `this.emitAsset(assetName: string, source: string) => string`

Emits a custom file that is included in the build output, returning an `assetReferenceId` that can be used to reference the emitted file. You can defer setting the source if you provide it later via [`this.setAssetSource(assetReferenceId, source)`](guide/en/#thissetassetsourceassetreferenceid-string-source-string--buffer--void). A string or Buffer source must be set for each asset through either method or an error will be thrown on generate completion.

Emitted assets will follow the [`output.assetFileNames`](guide/en/#outputassetfilenames) naming scheme. You can reference the URL of the file in any code returned by a [`load`](guide/en/#load) or [`transform`](guide/en/#transform) plugin hook via `import.meta.ROLLUP_ASSET_URL_assetReferenceId`. See [Asset URLs](guide/en/#asset-urls) for more details and an example.

The generated code that replaces `import.meta.ROLLUP_ASSET_URL_assetReferenceId` can be customized via the [`resolveFileUrl`](guide/en/#resolvefileurl) plugin hook. Once the asset has been finalized during `generate`, you can also use [`this.getAssetFileName(assetReferenceId)`](guide/en/#thisgetassetfilenameassetreferenceid-string--string) to determine the file name.

#### `this.emitChunk(moduleId: string, options?: {name?: string}) => string`

Emits a new chunk with the given module as entry point. This will not result in duplicate modules in the graph, instead if necessary, existing chunks will be split. It returns a `chunkReferenceId` that can be used to later access the generated file name of the chunk.

Emitted chunks will follow the [`output.chunkFileNames`](guide/en/#outputchunkfilenames), [`output.entryFileNames`](guide/en/#outputentryfilenames) naming scheme. If a `name` is provided, this will be used for the `[name]` file name placeholder, otherwise the name will be derived from the file name. If a `name` is provided, this name must not conflict with any other entry point names unless the entry points reference the same entry module. You can reference the URL of the emitted chunk in any code returned by a [`load`](guide/en/#load) or [`transform`](guide/en/#transform) plugin hook via `import.meta.ROLLUP_CHUNK_URL_chunkReferenceId`.

The generated code that replaces `import.meta.ROLLUP_CHUNK_URL_chunkReferenceId` can be customized via the [`resolveFileUrl`](guide/en/#resolvefileurl) plugin hook. Once the chunk has been rendered during `generate`, you can also use [`this.getChunkFileName(chunkReferenceId)`](guide/en/#thisgetchunkfilenamechunkreferenceid-string--string) to determine the file name.

#### `this.error(error: string | Error, position?: number | { column: number; line: number }) => never`

Structurally equivalent to `this.warn`, except that it will also abort the bundling process.

#### `this.getAssetFileName(assetReferenceId: string) => string`

Get the file name of an asset, according to the `assetFileNames` output option pattern. The file name will be relative to `outputOptions.dir`.

#### `this.getChunkFileName(chunkReferenceId: string) => string`

Get the file name of an emitted chunk. The file name will be relative to `outputOptions.dir`.

#### `this.getModuleInfo(moduleId: string) => ModuleInfo`

Returns additional information about the module in question in the form

```
{
  id: string, // the id of the module, for convenience
  isEntry: boolean, // is this a user- or plugin-defined entry point
  isExternal: boolean, // for external modules that are not included in the graph
  importedIds: string[], // the module ids imported by this module
  hasModuleSideEffects: boolean // are imports of this module included if nothing is imported from it
}
```

If the module id cannot be found, an error is thrown.

#### `this.meta: {rollupVersion: string}`

An `Object` containing potentially useful Rollup metadata. `meta` is the only context property accessible from the [`options`](guide/en/#options) hook.

#### `this.moduleIds: IterableIterator<string>`

An `Iterator` that gives access to all module ids in the current graph. It can be iterated via

```js
for (const moduleId of this.moduleIds) { /* ... */ }
```

or converted into an Array via `Array.from(this.moduleIds)`.

#### `this.parse(code: string, acornOptions: AcornOptions) => ESTree.Program`

Use Rollup's internal acorn instance to parse code to an AST.

#### `this.resolve(source: string, importer: string, options?: {skipSelf: boolean}) => Promise<{id: string, external: boolean} | null>`
Resolve imports to module ids (i.e. file names) using the same plugins that Rollup uses, and determine if an import should be external. If `null` is returned, the import could not be resolved by Rollup or any plugin but was not explicitly marked as external by the user.

If you pass `skipSelf: true`, then the `resolveId` hook of the plugin from which `this.resolve` is called will be skipped when resolving.

#### `this.setAssetSource(assetReferenceId: string, source: string | Buffer) => void`

Set the deferred source of an asset.

#### `this.warn(warning: string | RollupWarning, position?: number | { column: number; line: number }) => void`

Using this method will queue warnings for a build. These warnings will be printed by the CLI just like internally generated warnings (except with the plugin name), or captured by custom `onwarn` handlers.

The `warning` argument can be a `string` or an object with (at minimum) a `message` property:

```js
this.warn( 'hmm...' );
// is equivalent to
this.warn({ message: 'hmm...' });
```

Use the second form if you need to add additional properties to your warning object. Rollup will augment the warning object with a `plugin` property containing the plugin name, `code` (`PLUGIN_WARNING`) and `id` (the file being transformed) properties.

The `position` argument is a character index where the warning was raised. If present, Rollup will augment the warning object with `pos`, `loc` (a standard `{ file, line, column }` object) and `frame` (a snippet of code showing the error).

### Deprecated Context Functions

☢️ These context utility functions have been deprecated and may be removed in a future Rollup version.

- `this.isExternal(id: string, importer: string, isResolved: boolean): boolean` - _**Use [`this.resolve`](guide/en/#thisresolvesource-string-importer-string-options-skipself-boolean--promiseid-string-external-boolean--null)**_ - Determine if a given module ID is external when imported by `importer`. When `isResolved` is false, Rollup will try to resolve the id before testing if it is external.

- `this.resolveId(source: string, importer: string) => Promise<string | null>` - _**Use [`this.resolve`](guide/en/#thisresolvesource-string-importer-string-options-skipself-boolean--promiseid-string-external-boolean--null)**_ - Resolve imports to module ids (i.e. file names) using the same plugins that Rollup uses. Returns `null` if an id cannot be resolved.

### Asset URLs

To reference an asset URL reference from within JS code, use the `import.meta.ROLLUP_ASSET_URL_assetReferenceId` replacement. This will generate code that depends on the output format and generates a URL that points to the emitted file in the target environment. Note that all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available.

The following example will detect imports of `.svg` files, emit the imported files as assets, and return their URLs to be used e.g. as the `src` attribute of an `img` tag:

```js
// plugin
export default function svgResolverPlugin () {
  return ({
    resolveId(source, importer) {
      if (source.endsWith('.svg')) {
        return path.resolve(path.dirname(importer), source);
      }
    },
    load(id) {
      if (id.endsWith('.svg')) {
      	const assetReferenceId = this.emitAsset(
          path.basename(id),
          fs.readFileSync(id)
        );
        return `export default import.meta.ROLLUP_ASSET_URL_${assetReferenceId};`;
      }
    }
  });
}

// usage
import logo from '../images/logo.svg';
const image = document.createElement('img');
image.src = logo;
document.body.appendChild(image);
```

### Chunk URLs

Similar to assets, emitted chunks can be referenced from within JS code via the `import.meta.ROLLUP_CHUNK_URL_chunkReferenceId` replacement.

The following example will detect imports prefixed with `register-paint-worklet:` and generate the necessary code and separate chunk to generate a CSS paint worklet. Note that this will only work in modern browsers and will only work if the output format is set to `esm`.

```js
// plugin
const REGISTER_WORKLET = 'register-paint-worklet:';
export default function paintWorkletPlugin () {
  return ({
    load(id) {
      if (id.startsWith(REGISTER_WORKLET)) {
        return `CSS.paintWorklet.addModule(import.meta.ROLLUP_CHUNK_URL_${this.emitChunk(
          id.slice(REGISTER_WORKLET.length)
        )});`;
      }
    },
    resolveId(source, importer) {
      // We remove the prefix, resolve everything to absolute ids and add the prefix again
      // This makes sure that you can use relative imports to define worklets
      if (source.startsWith(REGISTER_WORKLET)) {
        return this.resolveId(source.slice(REGISTER_WORKLET.length), importer).then(
          id => REGISTER_WORKLET + id
        );
      }
      return null;
    }
  });
}
```

Usage:

```js
// main.js
import 'register-paint-worklet:./worklet.js';
import { color, size } from './config.js';
document.body.innerHTML += `<h1 style="background-image: paint(vertical-lines);">color: ${color}, size: ${size}</h1>`;

// worklet.js
import { color, size } from './config.js';
registerPaint(
	'vertical-lines',
	class {
		paint(ctx, geom) {
			for (let x = 0; x < geom.width / size; x++) {
				ctx.beginPath();
				ctx.fillStyle = color;
				ctx.rect(x * size, 0, 2, geom.height);
				ctx.fill();
			}
		}
	}
);

// config.js
export const color = 'greenyellow';
export const size = 6;
```

If you build this code, both the main chunk and the worklet will share the code from `config.js` via a shared chunk. This enables us to make use of the browser cache to reduce transmitted data and speed up loading the worklet.

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
