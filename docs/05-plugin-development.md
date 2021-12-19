---
title: Plugin Development
---

### Plugins Overview

A Rollup plugin is an object with one or more of the [properties](guide/en/#properties), [build hooks](guide/en/#build-hooks), and [output generation hooks](guide/en/#output-generation-hooks) described below, and which follows our [conventions](guide/en/#conventions). A plugin should be distributed as a package which exports a function that can be called with plugin specific options and returns such an object.

Plugins allow you to customise Rollup's behaviour by, for example, transpiling code before bundling, or finding third-party modules in your `node_modules` folder. For an example on how to use them, see [Using plugins](guide/en/#using-plugins).

A List of Plugins may be found at [github.com/rollup/awesome](https://github.com/rollup/awesome). If you would like to make a suggestion for a plugin, please submit a Pull Request.

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
    format: 'es'
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

**Type:** `string`

The name of the plugin, for use in error messages and warnings.

### Build Hooks

To interact with the build process, your plugin object includes 'hooks'. Hooks are functions which are called at various stages of the build. Hooks can affect how a build is run, provide information about a build, or modify a build once complete. There are different kinds of hooks:

- `async`: The hook may also return a promise resolving to the same type of value; otherwise, the hook is marked as `sync`.
- `first`: If several plugins implement this hook, the hooks are run sequentially until a hook returns a value other than `null` or `undefined`.
- `sequential`: If several plugins implement this hook, all of them will be run in the specified plugin order. If a hook is async, subsequent hooks of this kind will wait until the current hook is resolved.
- `parallel`: If several plugins implement this hook, all of them will be run in the specified plugin order. If a hook is async, subsequent hooks of this kind will be run in parallel and not wait for the current hook.

Build hooks are run during the build phase, which is triggered by `rollup.rollup(inputOptions)`. They are mainly concerned with locating, providing and transforming input files before they are processed by Rollup. The first hook of the build phase is [`options`](guide/en/#options), the last one is always [`buildEnd`](guide/en/#buildend). If there is a build error, [`closeBundle`](guide/en/#closebundle) will be called after that.

<!-- html:hooks-legend.html -->
<!-- mermaid:build-hooks.mmd -->

Additionally, in watch mode the [`watchChange`](guide/en/#watchchange) hook can be triggered at any time to notify a new run will be triggered once the current run has generated its outputs. Also, when watcher closes, the [`closeWatcher`](guide/en/#closewatcher) hook will be triggered.

See [Output Generation Hooks](guide/en/#output-generation-hooks) for hooks that run during the output generation phase to modify the generated output.

#### `buildEnd`

**Type:** `(error?: Error) => void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`moduleParsed`](guide/en/#moduleparsed), [`resolveId`](guide/en/#resolveid) or [`resolveDynamicImport`](guide/en/#resolvedynamicimport).<br> **Next Hook:** [`outputOptions`](guide/en/#outputoptions) in the output generation phase as this is the last hook of the build phase.

Called when rollup has finished bundling, but before `generate` or `write` is called; you can also return a Promise. If an error occurred during the build, it is passed on to this hook.

#### `buildStart`

**Type:** `(options: InputOptions) => void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`options`](guide/en/#options)<br> **Next Hook:** [`resolveId`](guide/en/#resolveid) to resolve each entry point in parallel.

Called on each `rollup.rollup` build. This is the recommended hook to use when you need access to the options passed to `rollup.rollup()` as it takes the transformations by all [`options`](guide/en/#options) hooks into account and also contains the right default values for unset options.

#### `closeWatcher`

**Type:** `() => void`<br> **Kind:** `sync, sequential`<br> **Previous/Next Hook:** This hook can be triggered at any time both during the build and the output generation phases. If that is the case, the current build will still proceed but no new [`watchChange`](guide/en/#watchchange) events will be triggered ever.

Notifies a plugin when watcher process closes and all open resources should be closed too. This hook cannot be used by output plugins.

#### `load`

**Type:** `(id: string) => string | null | {code: string, map?: string | SourceMap, ast? : ESTree.Program, moduleSideEffects?: boolean | "no-treeshake" | null, syntheticNamedExports?: boolean | string | null, meta?: {[plugin: string]: any} | null}`<br> **Kind:** `async, first`<br> **Previous Hook:** [`resolveId`](guide/en/#resolveid) or [`resolveDynamicImport`](guide/en/#resolvedynamicimport) where the loaded id was resolved. Additionally, this hook can be triggered at any time from plugin hooks by calling [`this.load`](guide/en/#thisload) to preload the module corresponding to an id.<br> **Next Hook:** [`transform`](guide/en/#transform) to transform the loaded file.

Defines a custom loader. Returning `null` defers to other `load` functions (and eventually the default behavior of loading from the file system). To prevent additional parsing overhead in case e.g. this hook already used `this.parse` to generate an AST for some reason, this hook can optionally return a `{ code, ast, map }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node. If the transformation does not move code, you can preserve existing sourcemaps by setting `map` to `null`. Otherwise you might need to generate the source map. See [the section on source code transformations](#source-code-transformations).

If `false` is returned for `moduleSideEffects` and no other module imports anything from this module, then this module will not be included in the bundle even if the module would have side-effects. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side-effects (such as modifying a global or exported variable). If `"no-treeshake"` is returned, treeshaking will be turned off for this module and it will also be included in one of the generated chunks even if it is empty. If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the first `resolveId` hook that resolved this module, the `treeshake.moduleSideEffects` option, or eventually default to `true`. The `transform` hook can override this.

See [synthetic named exports](guide/en/#synthetic-named-exports) for the effect of the `syntheticNamedExports` option. If `null` is returned or the flag is omitted, then `syntheticNamedExports` will be determined by the first `resolveId` hook that resolved this module or eventually default to `false`. The `transform` hook can override this.

See [custom module meta-data](guide/en/#custom-module-meta-data) for how to use the `meta` option. If a `meta` object is returned by this hook, it will be merged shallowly with any `meta` object returned by the resolveId hook. If no hook returns a `meta` object it will default to an empty object. The `transform` hook can further add or replace properties of this object.

You can use [`this.getModuleInfo`](guide/en/#thisgetmoduleinfo) to find out the previous values of `moduleSideEffects`, `syntheticNamedExports` and `meta` inside this hook.

#### `moduleParsed`

**Type:** `(moduleInfo: ModuleInfo) => void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`transform`](guide/en/#transform) where the currently handled file was transformed.<br> NextHook: [`resolveId`](guide/en/#resolveid) and [`resolveDynamicImport`](guide/en/#resolvedynamicimport) to resolve all discovered static and dynamic imports in parallel if present, otherwise [`buildEnd`](guide/en/#buildend).

This hook is called each time a module has been fully parsed by Rollup. See [`this.getModuleInfo`](guide/en/#thisgetmoduleinfo) for what information is passed to this hook.

In contrast to the [`transform`](guide/en/#transform) hook, this hook is never cached and can be used to get information about both cached and other modules, including the final shape of the `meta` property, the `code` and the `ast`.

This hook will wait until all imports are resolved so that the information in `moduleInfo.importedIds` and `moduleInfo.dynamicallyImportedIds` is complete and accurate. Note however that information about importing modules may be incomplete as additional importers could be discovered later. If you need this information, use the [`buildEnd`](guide/en/#buildend) hook.

#### `options`

**Type:** `(options: InputOptions) => InputOptions | null`<br> **Kind:** `async, sequential`<br> **Previous Hook:** This is the first hook of the build phase.<br> **Next Hook:** [`buildStart`](guide/en/#buildstart)

Replaces or manipulates the options object passed to `rollup.rollup`. Returning `null` does not replace anything. If you just need to read the options, it is recommended to use the [`buildStart`](guide/en/#buildstart) hook as that hook has access to the options after the transformations from all `options` hooks have been taken into account.

This is the only hook that does not have access to most [plugin context](guide/en/#plugin-context) utility functions as it is run before rollup is fully configured.

#### `resolveDynamicImport`

**Type:** `(specifier: string | ESTree.Node, importer: string) => string | false | null | {id: string, external?: boolean}`<br> **Kind:** `async, first`<br> **Previous Hook:** [`moduleParsed`](guide/en/#moduleparsed) for the importing file.<br> **Next Hook:** [`load`](guide/en/#load) if the hook resolved with an id that has not yet been loaded, [`resolveId`](guide/en/#resolveid) if the dynamic import contains a string and was not resolved by the hook, otherwise [`buildEnd`](guide/en/#buildend).

Defines a custom resolver for dynamic imports. Returning `false` signals that the import should be kept as it is and not be passed to other resolvers thus making it external. Similar to the [`resolveId`](guide/en/#resolveid) hook, you can also return an object to resolve the import to a different id while marking it as external at the same time.

In case a dynamic import is passed a string as argument, a string returned from this hook will be interpreted as an existing module id while returning `null` will defer to other resolvers and eventually to `resolveId` .

In case a dynamic import is not passed a string as argument, this hook gets access to the raw AST nodes to analyze and behaves slightly different in the following ways:

- If all plugins return `null`, the import is treated as `external` without a warning.
- If a string is returned, this string is _not_ interpreted as a module id but is instead used as a replacement for the import argument. It is the responsibility of the plugin to make sure the generated code is valid.
- To resolve such an import to an existing module, you can still return an object `{id, external}`.

Note that the return value of this hook will not be passed to `resolveId` afterwards; if you need access to the static resolution algorithm, you can use [`this.resolve(source, importer)`](guide/en/#thisresolve) on the plugin context.

#### `resolveId`

**Type:** `(source: string, importer: string | undefined, options: {isEntry: boolean, custom?: {[plugin: string]: any}) => string | false | null | {id: string, external?: boolean | "relative" | "absolute", moduleSideEffects?: boolean | "no-treeshake" | null, syntheticNamedExports?: boolean | string | null, meta?: {[plugin: string]: any} | null}`<br> **Kind:** `async, first`<br> **Previous Hook:** [`buildStart`](guide/en/#buildstart) if we are resolving an entry point, [`moduleParsed`](guide/en/#moduleparsed) if we are resolving an import, or as fallback for [`resolveDynamicImport`](guide/en/#resolvedynamicimport). Additionally, this hook can be triggered during the build phase from plugin hooks by calling [`this.emitFile`](guide/en/#thisemitfile) to emit an entry point or at any time by calling [`this.resolve`](guide/en/#thisresolve) to manually resolve an id.<br> **Next Hook:** [`load`](guide/en/#load) if the resolved id that has not yet been loaded, otherwise [`buildEnd`](guide/en/#buildend).

Defines a custom resolver. A resolver can be useful for e.g. locating third-party dependencies. Here `source` is the importee exactly as it is written in the import statement, i.e. for

```js
import { foo } from '../bar.js';
```

the source will be `"../bar.js"`.

The `importer` is the fully resolved id of the importing module. When resolving entry points, importer will usually be `undefined`. An exception here are entry points generated via [`this.emitFile`](guide/en/#thisemitfile) as here, you can provide an `importer` argument.

For those cases, the `isEntry` option will tell you if we are resolving a user defined entry point, an emitted chunk, or if the `isEntry` parameter was provided for the [`this.resolve`](guide/en/#thisresolve) context function.

You can use this for instance as a mechanism to define custom proxy modules for entry points. The following plugin will only expose the default export from entry points while still keeping named exports available for internal usage:

```js
function onlyDefaultForEntriesPlugin() {
  return {
    name: 'only-default-for-entries',
    async resolveId(source, importer, options) {
      if (options.isEntry) {
        // We need to skip this plugin to avoid an infinite loop
        const resolution = await this.resolve(source, importer, { skipSelf: true, ...options });
        // If it cannot be resolved, return `null` so that Rollup displays an error
        if (!resolution) return null;
        return `${resolution.id}?entry-proxy`;
      }
      return null;
    },
    load(id) {
      if (id.endsWith('?entry-proxy')) {
        const importee = id.slice(0, -'?entry-proxy'.length);
        // Note that this will throw if there is no default export
        return `export {default} from '${importee}';`;
      }
      return null;
    }
  };
}
```

Returning `null` defers to other `resolveId` functions and eventually the default resolution behavior. Returning `false` signals that `source` should be treated as an external module and not included in the bundle. If this happens for a relative import, the id will be renormalized the same way as when the `external` option is used.

If you return an object, then it is possible to resolve an import to a different id while excluding it from the bundle at the same time. This allows you to replace dependencies with external dependencies without the need for the user to mark them as "external" manually via the `external` option:

```js
function externalizeDependencyPlugin() {
  return {
    name: 'externalize-dependency',
    resolveId(source) {
      if (source === 'my-dependency') {
        return { id: 'my-dependency-develop', external: true };
      }
      return null;
    }
  };
}
```

If `external` is `true`, then absolute ids will be converted to relative ids based on the user's choice for the [`makeAbsoluteExternalsRelative`](guide/en/#makeabsoluteexternalsrelative) option. This choice can be overridden by passing either `external: "relative"` to always convert an absolute id to a relative id or `external: "absolute"` to keep it as an absolute id. When returning an object, relative external ids, i.e. ids starting with `./` or `../`, will _not_ be internally converted to an absolute id and converted back to a relative id in the output, but are instead included in the output unchanged. If you want relative ids to be renormalised and deduplicated instead, return an absolute file system location as `id` and choose `external: "relative"`.

If `false` is returned for `moduleSideEffects` in the first hook that resolves a module id and no other module imports anything from this module, then this module will not be included even if the module would have side-effects. If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side-effects (such as modifying a global or exported variable). If `"no-treeshake"` is returned, treeshaking will be turned off for this module and it will also be included in one of the generated chunks even if it is empty. If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the `treeshake.moduleSideEffects` option or default to `true`. The `load` and `transform` hooks can override this.

See [synthetic named exports](guide/en/#synthetic-named-exports) for the effect of the `syntheticNamedExports` option. If `null` is returned or the flag is omitted, then `syntheticNamedExports` will default to `false`. The `load` and `transform` hooks can override this.

See [custom module meta-data](guide/en/#custom-module-meta-data) for how to use the `meta` option. If `null` is returned or the option is omitted, then `meta` will default to an empty object. The `load` and `transform` hooks can add or replace properties of this object.

Note that while `resolveId` will be called for each import of a module and can therefore resolve to the same `id` many times, values for `external`, `moduleSideEffects`, `syntheticNamedExports` or `meta` can only be set once before the module is loaded. The reason is that after this call, Rollup will continue with the [`load`](guide/en/#load) and [`transform`](guide/en/#transform) hooks for that module that may override these values and should take precedence if they do so.

When triggering this hook from a plugin via [`this.resolve`](guide/en/#thisresolve), it is possible to pass a custom options object to this hook. While this object will be passed unmodified, plugins should follow the convention of adding a `custom` property with an object where the keys correspond to the names of the plugins that the options are intended for. For details see [custom resolver options](guide/en/#custom-resolver-options).

#### `transform`

**Type:** `(code: string, id: string) => string | null | {code?: string, map?: string | SourceMap, ast? : ESTree.Program, moduleSideEffects?: boolean | "no-treeshake" | null, syntheticNamedExports?: boolean | string | null, meta?: {[plugin: string]: any} | null}`<br> **Kind:** `async, sequential`<br> **Previous Hook:** [`load`](guide/en/#load) where the currently handled file was loaded.<br> NextHook: [`moduleParsed`](guide/en/#moduleparsed) once the file has been processed and parsed.

Can be used to transform individual modules. To prevent additional parsing overhead in case e.g. this hook already used `this.parse` to generate an AST for some reason, this hook can optionally return a `{ code, ast, map }` object. The `ast` must be a standard ESTree AST with `start` and `end` properties for each node. If the transformation does not move code, you can preserve existing sourcemaps by setting `map` to `null`. Otherwise you might need to generate the source map. See [the section on source code transformations](#source-code-transformations).

Note that in watch mode, the result of this hook is cached when rebuilding and the hook is only triggered again for a module `id` if either the `code` of the module has changed or a file has changed that was added via `this.addWatchFile` the last time the hook was triggered for this module.

You can also use the object form of the return value to configure additional properties of the module. Note that it's possible to return only properties and no code transformations.

If `false` is returned for `moduleSideEffects` and no other module imports anything from this module, then this module will not be included even if the module would have side-effects.

If `true` is returned, Rollup will use its default algorithm to include all statements in the module that have side-effects (such as modifying a global or exported variable).

If `"no-treeshake"` is returned, treeshaking will be turned off for this module and it will also be included in one of the generated chunks even if it is empty.

If `null` is returned or the flag is omitted, then `moduleSideEffects` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module, the `treeshake.moduleSideEffects` option, or eventually default to `true`.

See [synthetic named exports](guide/en/#synthetic-named-exports) for the effect of the `syntheticNamedExports` option. If `null` is returned or the flag is omitted, then `syntheticNamedExports` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module, the `treeshake.moduleSideEffects` option, or eventually default to `false`.

See [custom module meta-data](guide/en/#custom-module-meta-data) for how to use the `meta` option. If `null` is returned or the option is omitted, then `meta` will be determined by the `load` hook that loaded this module, the first `resolveId` hook that resolved this module or eventually default to an empty object.

You can use [`this.getModuleInfo`](guide/en/#thisgetmoduleinfo) to find out the previous values of `moduleSideEffects`, `syntheticNamedExports` and `meta` inside this hook.

#### `watchChange`

**Type:** `watchChange: (id: string, change: {event: 'create' | 'update' | 'delete'}) => void`<br> **Kind:** `sync, sequential`<br> **Previous/Next Hook:** This hook can be triggered at any time both during the build and the output generation phases. If that is the case, the current build will still proceed but a new build will be scheduled to start once the current build has completed, starting again with [`options`](guide/en/#options).

Notifies a plugin whenever rollup has detected a change to a monitored file in `--watch` mode. This hook cannot be used by output plugins. Second argument contains additional details of change event.

### Output Generation Hooks

Output generation hooks can provide information about a generated bundle and modify a build once complete. They work the same way and have the same types as [Build Hooks](guide/en/#build-hooks) but are called separately for each call to `bundle.generate(outputOptions)` or `bundle.write(outputOptions)`. Plugins that only use output generation hooks can also be passed in via the output options and therefore run only for certain outputs.

The first hook of the output generation phase is [`outputOptions`](guide/en/#outputoptions), the last one is either [`generateBundle`](guide/en/#generatebundle) if the output was successfully generated via `bundle.generate(...)`, [`writeBundle`](guide/en/#writebundle) if the output was successfully generated via `bundle.write(...)`, or [`renderError`](guide/en/#rendererror) if an error occurred at any time during the output generation.

<!-- html:hooks-legend.html -->
<!-- mermaid:output-generation-hooks.mmd -->

Additionally, [`closeBundle`](guide/en/#closebundle) can be called as the very last hook, but it is the responsibility of the User to manually call [`bundle.close()`](guide/en/#rolluprollup) to trigger this. The CLI will always make sure this is the case.

#### `augmentChunkHash`

**Type:** `(chunkInfo: ChunkInfo) => string`<br> **Kind:** `sync, sequential`<br> **Previous Hook:** [`renderDynamicImport`](guide/en/#renderdynamicimport) for each dynamic import expression.<br> **Next Hook:** [`resolveFileUrl`](guide/en/#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](guide/en/#resolveimportmeta) for all other accesses to `import.meta`.

Can be used to augment the hash of individual chunks. Called for each Rollup output chunk. Returning a falsy value will not modify the hash. Truthy values will be passed to [`hash.update`](https://nodejs.org/dist/latest-v12.x/docs/api/crypto.html#crypto_hash_update_data_inputencoding). The `chunkInfo` is a reduced version of the one in [`generateBundle`](guide/en/#generatebundle) without properties that rely on file names.

The following plugin will invalidate the hash of chunk `foo` with the timestamp of the last build:

```js
function augmentWithDatePlugin() {
  return {
    name: 'augment-with-date',
    augmentChunkHash(chunkInfo) {
      if (chunkInfo.name === 'foo') {
        return Date.now().toString();
      }
    }
  };
}
```

#### `banner`

**Type:** `string | (() => string)`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`renderStart`](guide/en/#renderstart)<br> **Next Hook:** [`renderDynamicImport`](guide/en/#renderdynamicimport) for each dynamic import expression.

Cf. [`output.banner/output.footer`](guide/en/#outputbanneroutputfooter).

#### `closeBundle`

**Type:** `closeBundle: () => Promise<void> | void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`buildEnd`](guide/en/#buildend) if there was a build error, otherwise when [`bundle.close()`](guide/en/#rolluprollup) is called, in which case this would be the last hook to be triggered.

Can be used to clean up any external service that may be running. Rollup's CLI will make sure this hook is called after each run, but it is the responsibility of users of the JavaScript API to manually call `bundle.close()` once they are done generating bundles. For that reason, any plugin relying on this feature should carefully mention this in its documentation.

If a plugin wants to retain resources across builds in watch mode, they can check for [`this.meta.watchMode`](guide/en/#thismeta) in this hook and perform the necessary cleanup for watch mode in [`closeWatcher`](guide/en/#closewatcher).

#### `footer`

**Type:** `string | (() => string)`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`renderStart`](guide/en/#renderstart)<br> **Next Hook:** [`renderDynamicImport`](guide/en/#renderdynamicimport) for each dynamic import expression.

Cf. [`output.banner/output.footer`](guide/en/#outputbanneroutputfooter).

#### `generateBundle`

**Type:** `(options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }, isWrite: boolean) => void`<br> **Kind:** `async, sequential`<br> **Previous Hook:** [`renderChunk`](guide/en/#renderchunk) for each chunk.<br> **Next Hook:** [`writeBundle`](guide/en/#writebundle) if the output was generated via `bundle.write(...)`, otherwise this is the last hook of the output generation phase and may again be followed by [`outputOptions`](guide/en/#outputoptions) if another output is generated.

Called at the end of `bundle.generate()` or immediately before the files are written in `bundle.write()`. To modify the files after they have been written, use the [`writeBundle`](guide/en/#writebundle) hook. `bundle` provides the full list of files being written or generated along with their details:

```ts
type AssetInfo = {
  fileName: string;
  name?: string;
  source: string | Uint8Array;
  type: 'asset';
};

type ChunkInfo = {
  code: string;
  dynamicImports: string[];
  exports: string[];
  facadeModuleId: string | null;
  fileName: string;
  implicitlyLoadedBefore: string[];
  imports: string[];
  importedBindings: { [imported: string]: string[] };
  isDynamicEntry: boolean;
  isEntry: boolean;
  isImplicitEntry: boolean;
  map: SourceMap | null;
  modules: {
    [id: string]: {
      renderedExports: string[];
      removedExports: string[];
      renderedLength: number;
      originalLength: number;
      code: string | null;
    };
  };
  name: string;
  referencedFiles: string[];
  type: 'chunk';
};
```

You can prevent files from being emitted by deleting them from the bundle object in this hook. To emit additional files, use the [`this.emitFile`](guide/en/#thisemitfile) plugin context function.

#### `intro`

**Type:** `string | (() => string)`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`renderStart`](guide/en/#renderstart)<br> **Next Hook:** [`renderDynamicImport`](guide/en/#renderdynamicimport) for each dynamic import expression.

Cf. [`output.intro/output.outro`](guide/en/#outputintrooutputoutro).

#### `outputOptions`

**Type:** `(outputOptions: OutputOptions) => OutputOptions | null`<br> **Kind:** `sync, sequential`<br> **Previous Hook:** [`buildEnd`](guide/en/#buildend) if this is the first time an output is generated, otherwise either [`generateBundle`](guide/en/#generatebundle), [`writeBundle`](guide/en/#writebundle) or [`renderError`](guide/en/#rendererror) depending on the previously generated output. This is the first hook of the output generation phase.<br> **Next Hook:** [`renderStart`](guide/en/#renderstart).

Replaces or manipulates the output options object passed to `bundle.generate()` or `bundle.write()`. Returning `null` does not replace anything. If you just need to read the output options, it is recommended to use the [`renderStart`](guide/en/#renderstart) hook as this hook has access to the output options after the transformations from all `outputOptions` hooks have been taken into account.

#### `outro`

**Type:** `string | (() => string)`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`renderStart`](guide/en/#renderstart)<br> **Next Hook:** [`renderDynamicImport`](guide/en/#renderdynamicimport) for each dynamic import expression.

Cf. [`output.intro/output.outro`](guide/en/#outputintrooutputoutro).

#### `renderChunk`

**Type:** `(code: string, chunk: ChunkInfo, options: OutputOptions) => string | { code: string, map: SourceMap } | null`<br> **Kind:** `async, sequential`<br> **Previous Hook:** [`resolveFileUrl`](guide/en/#resolvefileurl) for each use of `import.meta.ROLLUP_FILE_URL_referenceId` and [`resolveImportMeta`](guide/en/#resolveimportmeta) for all other accesses to `import.meta`.<br> **Next Hook:** [`generateBundle`](guide/en/#generatebundle).

Can be used to transform individual chunks. Called for each Rollup output chunk file. Returning `null` will apply no transformations.

#### `renderDynamicImport`

**Type:** `({format: string, moduleId: string, targetModuleId: string | null, customResolution: string | null}) => {left: string, right: string} | null`<br> **Kind:** `sync, first`<br> **Previous Hook:** [`banner`](guide/en/#banner), [`footer`](guide/en/#footer), [`intro`](guide/en/#intro), [`outro`](guide/en/#outro).<br> **Next Hook:** [`augmentChunkHash`](guide/en/#augmentchunkhash) for each chunk that would contain a hash in the file name.

This hook provides fine-grained control over how dynamic imports are rendered by providing replacements for the code to the left (`import(`) and right (`)`) of the argument of the import expression. Returning `null` defers to other hooks of this type and ultimately renders a format-specific default.

`format` is the rendered output format, `moduleId` the id of the module performing the dynamic import. If the import could be resolved to an internal or external id, then `targetModuleId` will be set to this id, otherwise it will be `null`. If the dynamic import contained a non-string expression that was resolved by a [`resolveDynamicImport`](guide/en/#resolvedynamicimport) hook to a replacement string, then `customResolution` will contain that string.

The following code will replace all dynamic imports with a custom handler, adding `import.meta.url` as a second argument to allow the handler to resolve relative imports correctly:

```js
function dynamicImportPolyfillPlugin() {
  return {
    name: 'dynamic-import-polyfill',
    renderDynamicImport() {
      return {
        left: 'dynamicImportPolyfill(',
        right: ', import.meta.url)'
      };
    }
  };
}

// input
import('./lib.js');

// output
dynamicImportPolyfill('./lib.js', import.meta.url);
```

The next plugin will make sure all dynamic imports of `esm-lib` are marked as external and retained as import expressions to e.g. allow a CommonJS build to import an ES module in Node 13+, cf. how to [import ES modules from CommonJS](https://nodejs.org/api/esm.html#esm_import_expressions) in the Node documentation.

```js
function retainImportExpressionPlugin() {
  return {
    name: 'retain-import-expression',
    resolveDynamicImport(specifier) {
      if (specifier === 'esm-lib') return false;
      return null;
    },
    renderDynamicImport({ targetModuleId }) {
      if (targetModuleId === 'esm-lib') {
        return {
          left: 'import(',
          right: ')'
        };
      }
    }
  };
}
```

Note that when this hook rewrites dynamic imports in non-ES formats, no interop code to make sure that e.g. the default export is available as `.default` is generated. It is the responsibility of the plugin to make sure the rewritten dynamic import returns a Promise that resolves to a proper namespace object.

#### `renderError`

**Type:** `(error: Error) => void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** Any hook from [`renderStart`](guide/en/#renderstart) to [`renderChunk`](guide/en/#renderchunk).<br> **Next Hook:** If it is called, this is the last hook of the output generation phase and may again be followed by [`outputOptions`](guide/en/#outputoptions) if another output is generated.

Called when rollup encounters an error during `bundle.generate()` or `bundle.write()`. The error is passed to this hook. To get notified when generation completes successfully, use the `generateBundle` hook.

#### `renderStart`

**Type:** `(outputOptions: OutputOptions, inputOptions: InputOptions) => void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`outputOptions`](guide/en/#outputoptions)<br> **Next Hook:** [`banner`](guide/en/#banner), [`footer`](guide/en/#footer), [`intro`](guide/en/#intro) and [`outro`](guide/en/#outro) run in parallel.

Called initially each time `bundle.generate()` or `bundle.write()` is called. To get notified when generation has completed, use the `generateBundle` and `renderError` hooks. This is the recommended hook to use when you need access to the output options passed to `bundle.generate()` or `bundle.write()` as it takes the transformations by all [`outputOptions`](guide/en/#outputoptions) hooks into account and also contains the right default values for unset options. It also receives the input options passed to `rollup.rollup()` so that plugins that can be used as output plugins, i.e. plugins that only use `generate` phase hooks, can get access to them.

#### `resolveFileUrl`

**Type:** `({chunkId: string, fileName: string, format: string, moduleId: string, referenceId: string, relativePath: string}) => string | null`<br> **Kind:** `sync, first`<br> **Previous Hook:** [`augmentChunkHash`](guide/en/#augmentchunkhash) for each chunk that would contain a hash in the file name.<br> **Next Hook:** [`renderChunk`](guide/en/#renderchunk) for each chunk.

Allows to customize how Rollup resolves URLs of files that were emitted by plugins via `this.emitFile`. By default, Rollup will generate code for `import.meta.ROLLUP_FILE_URL_referenceId` that should correctly generate absolute URLs of emitted files independent of the output format and the host system where the code is deployed.

For that, all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available. In case that fails or to generate more optimized code, this hook can be used to customize this behaviour. To do that, the following information is available:

- `chunkId`: The id of the chunk this file is referenced from.
- `fileName`: The path and file name of the emitted asset, relative to `output.dir` without a leading `./`.
- `format`: The rendered output format.
- `moduleId`: The id of the original module this file is referenced from. Useful for conditionally resolving certain assets differently.
- `referenceId`: The reference id of the file.
- `relativePath`: The path and file name of the emitted file, relative to the chunk the file is referenced from. This will path will contain no leading `./` but may contain a leading `../`.

Note that since this hook has access to the filename of the current chunk, its return value will not be considered when generating the hash of this chunk.

The following plugin will always resolve all files relative to the current document:

```js
function resolveToDocumentPlugin() {
  return {
    name: 'resolve-to-document',
    resolveFileUrl({ fileName }) {
      return `new URL('${fileName}', document.baseURI).href`;
    }
  };
}
```

#### `resolveImportMeta`

**Type:** `(property: string | null, {chunkId: string, moduleId: string, format: string}) => string | null`<br> **Kind:** `sync, first`<br> **Previous Hook:** [`augmentChunkHash`](guide/en/#augmentchunkhash) for each chunk that would contain a hash in the file name.<br> **Next Hook:** [`renderChunk`](guide/en/#renderchunk) for each chunk.

Allows to customize how Rollup handles `import.meta` and `import.meta.someProperty`, in particular `import.meta.url`. In ES modules, `import.meta` is an object and `import.meta.url` contains the URL of the current module, e.g. `http://server.net/bundle.js` for browsers or `file:///path/to/bundle.js` in Node.

By default for formats other than ES modules, Rollup replaces `import.meta.url` with code that attempts to match this behaviour by returning the dynamic URL of the current chunk. Note that all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available. For other properties, `import.meta.someProperty` is replaced with `undefined` while `import.meta` is replaced with an object containing a `url` property.

This behaviour can be changed—also for ES modules—via this hook. For each occurrence of `import.meta<.someProperty>`, this hook is called with the name of the property or `null` if `import.meta` is accessed directly. For example, the following code will resolve `import.meta.url` using the relative path of the original module to the current working directory and again resolve this path against the base URL of the current document at runtime:

```js
function importMetaUrlCurrentModulePlugin() {
  return {
    name: 'import-meta-url-current-module',
    resolveImportMeta(property, { moduleId }) {
      if (property === 'url') {
        return `new URL('${path.relative(process.cwd(), moduleId)}', document.baseURI).href`;
      }
      return null;
    }
  };
}
```

Note that since this hook has access to the filename of the current chunk, its return value will not be considered when generating the hash of this chunk.

#### `writeBundle`

**Type:** `(options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }) => void`<br> **Kind:** `async, parallel`<br> **Previous Hook:** [`generateBundle`](guide/en/#generatebundle)<br> **Next Hook:** If it is called, this is the last hook of the output generation phase and may again be followed by [`outputOptions`](guide/en/#outputoptions) if another output is generated.

Called only at the end of `bundle.write()` once all files have been written. Similar to the [`generateBundle`](guide/en/#generatebundle) hook, `bundle` provides the full list of files being written along with their details.

### Deprecated Hooks

☢️ These hooks have been deprecated and may be removed in a future Rollup version.

- `resolveAssetUrl` - _**Use [`resolveFileUrl`](guide/en/#resolvefileurl)**_ - Function hook that allows to customize the generated code for asset URLs.

More properties may be supported in the future, as and when they prove necessary.

### Plugin Context

A number of utility functions and informational bits can be accessed from within most [hooks](guide/en/#build-hooks) via `this`:

#### `this.addWatchFile`

**Type:** `(id: string) => void`

Adds additional files to be monitored in watch mode so that changes to these files will trigger rebuilds. `id` can be an absolute path to a file or directory or a path relative to the current working directory. This context function can only be used in hooks during the build phase, i.e. in `buildStart`, `load`, `resolveId`, and `transform`.

**Note:** Usually in watch mode to improve rebuild speed, the `transform` hook will only be triggered for a given module if its contents actually changed. Using `this.addWatchFile` from within the `transform` hook will make sure the `transform` hook is also reevaluated for this module if the watched file changes.

In general, it is recommended to use `this.addWatchFile` from within the hook that depends on the watched file.

#### `this.emitFile`

**Type:** `(emittedFile: EmittedChunk | EmittedAsset) => string`

Emits a new file that is included in the build output and returns a `referenceId` that can be used in various places to reference the emitted file. `emittedFile` can have one of two forms:

```ts
type EmittedChunk = {
  type: 'chunk';
  id: string;
  name?: string;
  fileName?: string;
  implicitlyLoadedAfterOneOf?: string[];
  importer?: string;
  preserveSignature?: 'strict' | 'allow-extension' | 'exports-only' | false;
};

type EmittedAsset = {
  type: 'asset';
  name?: string;
  fileName?: string;
  source?: string | Uint8Array;
};
```

In both cases, either a `name` or a `fileName` can be supplied. If a `fileName` is provided, it will be used unmodified as the name of the generated file, throwing an error if this causes a conflict. Otherwise if a `name` is supplied, this will be used as substitution for `[name]` in the corresponding [`output.chunkFileNames`](guide/en/#outputchunkfilenames) or [`output.assetFileNames`](guide/en/#outputassetfilenames) pattern, possibly adding a unique number to the end of the file name to avoid conflicts. If neither a `name` nor `fileName` is supplied, a default name will be used.

You can reference the URL of an emitted file in any code returned by a [`load`](guide/en/#load) or [`transform`](guide/en/#transform) plugin hook via `import.meta.ROLLUP_FILE_URL_referenceId`. See [File URLs](guide/en/#file-urls) for more details and an example.

The generated code that replaces `import.meta.ROLLUP_FILE_URL_referenceId` can be customized via the [`resolveFileUrl`](guide/en/#resolvefileurl) plugin hook. You can also use [`this.getFileName(referenceId)`](guide/en/#thisgetfilename) to determine the file name as soon as it is available

If the `type` is _`chunk`_, then this emits a new chunk with the given module `id` as entry point. To resolve it, the `id` will be passed through build hooks just like regular entry points, starting with [`resolveId`](guide/en/#resolveid). If an `importer` is provided, this acts as the second parameter of `resolveId` and is important to properly resolve relative paths. If it is not provided, paths will be resolved relative to the current working directory. If a value for `preserveSignature` is provided, this will override [`preserveEntrySignatures`](guide/en/#preserveentrysignatures) for this particular chunk.

This will not result in duplicate modules in the graph, instead if necessary, existing chunks will be split or a facade chunk with reexports will be created. Chunks with a specified `fileName` will always generate separate chunks while other emitted chunks may be deduplicated with existing chunks even if the `name` does not match. If such a chunk is not deduplicated, the [`output.chunkFileNames`](guide/en/#outputchunkfilenames) name pattern will be used.

By default, Rollup assumes that emitted chunks are executed independent of other entry points, possibly even before any other code is executed. This means that if an emitted chunk shares a dependency with an existing entry point, Rollup will create an additional chunk for dependencies that are shared between those entry points. Providing a non-empty array of module ids for `implicitlyLoadedAfterOneOf` will change that behaviour by giving Rollup additional information to prevent this in some cases. Those ids will be resolved the same way as the `id` property, respecting the `importer` property if it is provided. Rollup will now assume that the emitted chunk is only executed if at least one of the entry points that lead to one of the ids in `implicitlyLoadedAfterOneOf` being loaded has already been executed, creating the same chunks as if the newly emitted chunk was only reachable via dynamic import from the modules in `implicitlyLoadedAfterOneOf`. Here is an example that uses this to create a simple HTML file with several scripts, creating optimized chunks to respect their execution order:

```js
// rollup.config.js
function generateHtmlPlugin() {
  let ref1, ref2, ref3;
  return {
    name: 'generate-html',
    buildStart() {
      ref1 = this.emitFile({
        type: 'chunk',
        id: 'src/entry1'
      });
      ref2 = this.emitFile({
        type: 'chunk',
        id: 'src/entry2',
        implicitlyLoadedAfterOneOf: ['src/entry1']
      });
      ref3 = this.emitFile({
        type: 'chunk',
        id: 'src/entry3',
        implicitlyLoadedAfterOneOf: ['src/entry2']
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Title</title>
         </head>
        <body>
          <script src="${this.getFileName(ref1)}" type="module"></script>
          <script src="${this.getFileName(ref2)}" type="module"></script>
          <script src="${this.getFileName(ref3)}" type="module"></script>
        </body>
        </html>`
      });
    }
  };
}

export default {
  input: [],
  preserveEntrySignatures: false,
  plugins: [generateHtmlPlugin()],
  output: {
    format: 'es',
    dir: 'dist'
  }
};
```

If there are no dynamic imports, this will create exactly three chunks where the first chunk contains all dependencies of `src/entry1`, the second chunk contains only the dependencies of `src/entry2` that are not contained in the first chunk, importing those from the first chunk, and again the same for the third chunk.

Note that even though any module id can be used in `implicitlyLoadedAfterOneOf`, Rollup will throw an error if such an id cannot be uniquely associated with a chunk, e.g. because the `id` cannot be reached implicitly or explicitly from the existing static entry points, or because the file is completely tree-shaken. Using only entry points, either defined by the user or of previously emitted chunks, will always work, though.

If the `type` is _`asset`_, then this emits an arbitrary new file with the given `source` as content. It is possible to defer setting the `source` via [`this.setAssetSource(referenceId, source)`](guide/en/#thissetassetsource) to a later time to be able to reference a file during the build phase while setting the source separately for each output during the generate phase. Assets with a specified `fileName` will always generate separate files while other emitted assets may be deduplicated with existing assets if they have the same source even if the `name` does not match. If such an asset is not deduplicated, the [`output.assetFileNames`](guide/en/#outputassetfilenames) name pattern will be used.

#### `this.error`

**Type:** `(error: string | Error, position?: number | { column: number; line: number }) => never`

Structurally equivalent to `this.warn`, except that it will also abort the bundling process.

#### `this.getCombinedSourcemap`

**Type:** `() => SourceMap`

Get the combined source maps of all previous plugins. This context function can only be used in the [`transform`](guide/en/#transform) plugin hook.

#### `this.getFileName`

**Type:** `(referenceId: string) => string`

Get the file name of a chunk or asset that has been emitted via [`this.emitFile`](guide/en/#thisemitfile). The file name will be relative to `outputOptions.dir`.

#### `this.getModuleIds`

**Type:** `() => IterableIterator<string>`

Returns an `Iterator` that gives access to all module ids in the current graph. It can be iterated via

```js
for (const moduleId of this.getModuleIds()) {
  /* ... */
}
```

or converted into an Array via `Array.from(this.getModuleIds())`.

#### `this.getModuleInfo`

**Type:** `(moduleId: string) => (ModuleInfo | null)`

Returns additional information about the module in question in the form

```ts
type ModuleInfo = {
  id: string; // the id of the module, for convenience
  code: string | null; // the source code of the module, `null` if external or not yet available
  ast: ESTree.Program; // the parsed abstract syntax tree if available
  isEntry: boolean; // is this a user- or plugin-defined entry point
  isExternal: boolean; // for external modules that are referenced but not included in the graph
  isIncluded: boolean | null; // is the module included after tree-shaking, `null` if external or not yet available
  importedIds: string[]; // the module ids statically imported by this module
  importers: string[]; // the ids of all modules that statically import this module
  dynamicallyImportedIds: string[]; // the module ids imported by this module via dynamic import()
  dynamicImporters: string[]; // the ids of all modules that import this module via dynamic import()
  implicitlyLoadedAfterOneOf: string[]; // implicit relationships, declared via this.emitFile
  implicitlyLoadedBefore: string[]; // implicit relationships, declared via this.emitFile
  hasModuleSideEffects: boolean | 'no-treeshake'; // are imports of this module included if nothing is imported from it
  meta: { [plugin: string]: any }; // custom module meta-data
  syntheticNamedExports: boolean | string; // final value of synthetic named exports
};
```

During the build, this object represents currently available information about the module. Before the [`buildEnd`](guide/en/#buildend) hook, this information may be incomplete as e.g. the `importedIds` are not yet resolved or additional `importers` are discovered.

Returns `null` if the module id cannot be found.

#### `this.getWatchFiles`

**Type:** `() => string[]`

Get ids of the files which has been watched previously. Include both files added by plugins with `this.addWatchFile` and files added implicitly by rollup during the build.

#### `this.load`

**Type:** `({id: string, moduleSideEffects?: boolean | 'no-treeshake' | null, syntheticNamedExports?: boolean | string | null, meta?: {[plugin: string]: any} | null}) => Promise<ModuleInfo>`

Loads and parses the module corresponding to the given id, attaching additional meta information to the module if provided. This will trigger the same [`load`](guide/en/#load), [`transform`](guide/en/#transform) and [`moduleParsed`](guide/en/#moduleparsed) hooks that would be triggered if the module were imported by another module.

This allows you to inspect the final content of modules before deciding how to resolve them in the [`resolveId`](guide/en/#resolveid) hook and e.g. resolve to a proxy module instead. If the module becomes part of the graph later, there is no additional overhead from using this context function as the module will not be parsed again. The signature allows you to directly pass the return value of [`this.resolve`](guide/en/#thisresolve) to this function as long as it is neither `null` nor external.

The returned promise will resolve once the module has been fully transformed and parsed but before any imports have been resolved. That means that the resulting `ModuleInfo` will have empty `importedIds` and `dynamicallyImportedIds`. This helps to avoid deadlock situations when awaiting `this.load` in a `resolveId` hook. If you are interested in `importedIds` and `dynamicallyImportedIds`, you should implement a `moduleParsed` hook.

Note that with regard to the `moduleSideEffects`, `syntheticNamedExports` and `meta` options, the same restrictions apply as for the `resolveId` hook: Their values only have an effect if the module has not been loaded yet. Thus, it is very important to use `this.resolve` first to find out if any plugins want to set special values for these options in their `resolveId` hook, and pass these options on to `this.load` if appropriate. The example below showcases how this can be handled to add a proxy module for modules containing a special code comment:

```js
export default function addProxyPlugin() {
  return {
    async resolveId(source, importer, options) {
      if (importer?.endsWith('?proxy')) {
        // Do not proxy ids used in proxies
        return null;
      }
      // We make sure to pass on any resolveId options to this.resolve to get the module id
      const resolution = await this.resolve(source, importer, { skipSelf: true, ...options });
      // We can only pre-load existing and non-external ids
      if (resolution && !resolution.external) {
        // we pass on the entire resolution information
        const moduleInfo = await this.load(resolution);
        if (moduleInfo.code.indexOf('/* use proxy */') >= 0) {
          return `${resolution.id}?proxy`;
        }
      }
      // As we already fully resolved the module, there is no reason to resolve it again
      return resolution;
    },
    load(id) {
      if (id.endsWith('?proxy')) {
        const importee = id.slice(0, -'?proxy'.length);
        return `console.log('proxy for ${importee}'); export * from ${JSON.stringify(importee)};`;
      }
      return null;
    }
  };
}
```

If the module was already loaded, this will just wait for the parsing to complete and then return its module information. If the module was not yet imported by another module, this will not automatically trigger loading other modules imported by this module. Instead, static and dynamic dependencies will only be loaded once this module has actually been imported at least once.

While it is safe to use `this.load` in a `resolveId` hook, you should be very careful when awaiting it in a `load` or `transform` hook. If there are cyclic dependencies in the module graph, this can easily lead to a deadlock, so any plugin needs to manually take care to avoid waiting for `this.load` inside the `load` or `transform` of the any module that is in a cycle with the loaded module.

#### `this.meta`

**Type:** `{rollupVersion: string, watchMode: boolean}`

An object containing potentially useful Rollup metadata:

- `rollupVersion`: The currently running version of Rollup as define in `package.json`.
- `watchMode`: `true` if Rollup was started via `rollup.watch(...)` or from the command line with `--watch`, `false` otherwise.

`meta` is the only context property accessible from the [`options`](guide/en/#options) hook.

#### `this.parse`

**Type:** `(code: string, acornOptions?: AcornOptions) => ESTree.Program`

Use Rollup's internal acorn instance to parse code to an AST.

#### `this.resolve`

**Type:** `(source: string, importer?: string, options?: {skipSelf?: boolean, isEntry?: boolean, isEntry?: boolean, custom?: {[plugin: string]: any}}) => Promise<{id: string, external: boolean | "absolute", moduleSideEffects: boolean | 'no-treeshake', syntheticNamedExports: boolean | string, meta: {[plugin: string]: any}} | null>`

Resolve imports to module ids (i.e. file names) using the same plugins that Rollup uses, and determine if an import should be external. If `null` is returned, the import could not be resolved by Rollup or any plugin but was not explicitly marked as external by the user. If an absolute external id is returned that should remain absolute in the output either via the [`makeAbsoluteExternalsRelative`](guide/en/#makeabsoluteexternalsrelative) option or by explicit plugin choice in the [`resolveId`](guide/en/#resolveid) hook, `external` will be `"absolute"` instead of `true`.

If you pass `skipSelf: true`, then the `resolveId` hook of the plugin from which `this.resolve` is called will be skipped when resolving. When other plugins themselves also call `this.resolve` in their `resolveId` hooks with the _exact same `source` and `importer`_ while handling the original `this.resolve` call, then the `resolveId` hook of the original plugin will be skipped for those calls as well. The rationale here is that the plugin already stated that it "does not know" how to resolve this particular combination of `source` and `importer` at this point in time. If you do not want this behaviour, do not use `skipSelf` but implement your own infinite loop prevention mechanism if necessary.

You can also pass an object of plugin-specific options via the `custom` option, see [custom resolver options](guide/en/#custom-resolver-options) for details.

The value for `isEntry` you pass here will be passed along to the [`resolveId`](guide/en/#resolveid) hooks handling this call, otherwise `false` will be passed if there is an importer and `true` if there is not.

When calling this function from a `resolveId` hook, you should always check if it makes sense for you to pass along the `isEntry` and `custom` options.

#### `this.setAssetSource`

**Type:** `(referenceId: string, source: string | Uint8Array) => void`

Set the deferred source of an asset. Note that you can also pass a Node `Buffer` as `source` as it is a sub-class of `Uint8Array`.

#### `this.warn`

**Type:** `(warning: string | RollupWarning, position?: number | { column: number; line: number }) => void`

Using this method will queue warnings for a build. These warnings will be printed by the CLI just like internally generated warnings (except with the plugin name), or captured by custom `onwarn` handlers.

The `warning` argument can be a `string` or an object with (at minimum) a `message` property:

```js
this.warn('hmm...');
// is equivalent to
this.warn({ message: 'hmm...' });
```

Use the second form if you need to add additional properties to your warning object. Rollup will augment the warning object with a `plugin` property containing the plugin name, `code` (`PLUGIN_WARNING`) and `id` (the file being transformed) properties.

The `position` argument is a character index where the warning was raised. If present, Rollup will augment the warning object with `pos`, `loc` (a standard `{ file, line, column }` object) and `frame` (a snippet of code showing the error).

### Deprecated Context Functions

☢️ These context utility functions have been deprecated and may be removed in a future Rollup version.

- `this.emitAsset(assetName: string, source: string) => string` - _**Use [`this.emitFile`](guide/en/#thisemitfile)**_ - Emits a custom file that is included in the build output, returning a `referenceId` that can be used to reference the emitted file. You can defer setting the source if you provide it later via [`this.setAssetSource(referenceId, source)`](guide/en/#thissetassetsource). A string or `Uint8Array`/`Buffer` source must be set for each asset through either method or an error will be thrown on generate completion.

  Emitted assets will follow the [`output.assetFileNames`](guide/en/#outputassetfilenames) naming scheme. You can reference the URL of the file in any code returned by a [`load`](guide/en/#load) or [`transform`](guide/en/#transform) plugin hook via `import.meta.ROLLUP_ASSET_URL_referenceId`.

  The generated code that replaces `import.meta.ROLLUP_ASSET_URL_referenceId` can be customized via the [`resolveFileUrl`](guide/en/#resolvefileurl) plugin hook. Once the asset has been finalized during `generate`, you can also use [`this.getFileName(referenceId)`](guide/en/#thisgetfilename) to determine the file name.

- `this.emitChunk(moduleId: string, options?: {name?: string}) => string` - _**Use [`this.emitFile`](guide/en/#thisemitfile)**_ - Emits a new chunk with the given module as entry point. This will not result in duplicate modules in the graph, instead if necessary, existing chunks will be split. It returns a `referenceId` that can be used to later access the generated file name of the chunk.

  Emitted chunks will follow the [`output.chunkFileNames`](guide/en/#outputchunkfilenames), [`output.entryFileNames`](guide/en/#outputentryfilenames) naming scheme. If a `name` is provided, this will be used for the `[name]` file name placeholder, otherwise the name will be derived from the file name. If a `name` is provided, this name must not conflict with any other entry point names unless the entry points reference the same entry module. You can reference the URL of the emitted chunk in any code returned by a [`load`](guide/en/#load) or [`transform`](guide/en/#transform) plugin hook via `import.meta.ROLLUP_CHUNK_URL_referenceId`.

  The generated code that replaces `import.meta.ROLLUP_CHUNK_URL_referenceId` can be customized via the [`resolveFileUrl`](guide/en/#resolvefileurl) plugin hook. Once the chunk has been rendered during `generate`, you can also use [`this.getFileName(referenceId)`](guide/en/#thisgetfilename) to determine the file name.

- `this.getAssetFileName(referenceId: string) => string` - _**Use [`this.getFileName`](guide/en/#thisgetfilename)**_ - Get the file name of an asset, according to the `assetFileNames` output option pattern. The file name will be relative to `outputOptions.dir`.

- `this.getChunkFileName(referenceId: string) => string` - _**Use [`this.getFileName`](guide/en/#thisgetfilename)**_ - Get the file name of an emitted chunk. The file name will be relative to `outputOptions.dir`.

- `this.isExternal(id: string, importer: string | undefined, isResolved: boolean) => boolean` - _**Use [`this.resolve`](guide/en/#thisresolve)**_ - Determine if a given module ID is external when imported by `importer`. When `isResolved` is false, Rollup will try to resolve the id before testing if it is external.

- `this.moduleIds: IterableIterator<string>` - _**Use [`this.getModuleIds`](guide/en/#thisgetmoduleids)**_ - An `Iterator` that gives access to all module ids in the current graph. It can be iterated via

  ```js
  for (const moduleId of this.moduleIds) {
    /* ... */
  }
  ```

  or converted into an Array via `Array.from(this.moduleIds)`.

- `this.resolveId(source: string, importer?: string) => Promise<string | null>` - _**Use [`this.resolve`](guide/en/#thisresolve)**_ - Resolve imports to module ids (i.e. file names) using the same plugins that Rollup uses. Returns `null` if an id cannot be resolved.

### File URLs

To reference a file URL reference from within JS code, use the `import.meta.ROLLUP_FILE_URL_referenceId` replacement. This will generate code that depends on the output format and generates a URL that points to the emitted file in the target environment. Note that all formats except CommonJS and UMD assume that they run in a browser environment where `URL` and `document` are available.

The following example will detect imports of `.svg` files, emit the imported files as assets, and return their URLs to be used e.g. as the `src` attribute of an `img` tag:

```js
function svgResolverPlugin() {
  return {
    name: 'svg-resolver',
    resolveId(source, importer) {
      if (source.endsWith('.svg')) {
        return path.resolve(path.dirname(importer), source);
      }
    },
    load(id) {
      if (id.endsWith('.svg')) {
        const referenceId = this.emitFile({
          type: 'asset',
          name: path.basename(id),
          source: fs.readFileSync(id)
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
    }
  };
}
```

Usage:

```js
import logo from '../images/logo.svg';
const image = document.createElement('img');
image.src = logo;
document.body.appendChild(image);
```

Similar to assets, emitted chunks can be referenced from within JS code via `import.meta.ROLLUP_FILE_URL_referenceId` as well.

The following example will detect imports prefixed with `register-paint-worklet:` and generate the necessary code and separate chunk to generate a CSS paint worklet. Note that this will only work in modern browsers and will only work if the output format is set to `es`.

```js
const REGISTER_WORKLET = 'register-paint-worklet:';

function registerPaintWorkletPlugin() {
  return {
    name: 'register-paint-worklet',
    load(id) {
      if (id.startsWith(REGISTER_WORKLET)) {
        return `CSS.paintWorklet.addModule(import.meta.ROLLUP_FILE_URL_${this.emitFile({
          type: 'chunk',
          id: id.slice(REGISTER_WORKLET.length)
        })});`;
      }
    },
    resolveId(source, importer) {
      // We remove the prefix, resolve everything to absolute ids and add the prefix again
      // This makes sure that you can use relative imports to define worklets
      if (source.startsWith(REGISTER_WORKLET)) {
        return this.resolve(source.slice(REGISTER_WORKLET.length), importer).then(
          resolvedId => REGISTER_WORKLET + resolvedId.id
        );
      }
      return null;
    }
  };
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

(Use [@rollup/pluginutils](https://github.com/rollup/plugins/tree/master/packages/pluginutils) for commonly needed functions, and to implement a transformer in the recommended manner.)

```js
import { createFilter } from '@rollup/pluginutils';

function transformCodePlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'transform-code',
    transform(code, id) {
      if (!filter(id)) return;

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

If the transformation does not move code, you can preserve existing sourcemaps by returning `null`:

```js
return {
  code: transformedCode,
  map: null
};
```

If you create a plugin that you think would be useful to others, please publish it to NPM and add submit it to [github.com/rollup/awesome](https://github.com/rollup/awesome)!

### Synthetic named exports

It is possible to designate a fallback export for missing exports by setting the `syntheticNamedExports` option for a module in the [`resolveId`](guide/en/#resolveid), [`load`](guide/en/#load) or [`transform`](guide/en/#transform) hook. If a string value is used for `syntheticNamedExports`, this module will fallback the resolution of any missing named exports to properties of the named export of the given name:

**dep.js: (`{syntheticNamedExports: '__synthetic'}`)**

```js
export const foo = 'explicit';
export const __synthetic = {
  foo: 'foo',
  bar: 'bar'
};
```

**main.js:**

```js
import { foo, bar, baz, __synthetic } from './dep.js';

// logs "explicit" as non-synthetic exports take precedence
console.log(foo);

// logs "bar", picking the property from __synthetic
console.log(bar);

// logs "undefined"
console.log(baz);

// logs "{foo:'foo',bar:'bar'}"
console.log(__synthetic);
```

When used as an entry point, only explicit exports will be exposed. The synthetic fallback export, i.e. `__synthetic` in the example, will not be exposed for string values of `syntheticNamedExports`. However if the value is `true`, the default export will be exposed. This is the only notable difference between `syntheticNamedExports: true` and `syntheticNamedExports: 'default'`.

### Inter-plugin communication

At some point when using many dedicated plugins, there may be the need for unrelated plugins to be able to exchange information during the build. There are several mechanisms through which Rollup makes this possible.

#### Custom resolver options

Assume you have a plugin that should resolve an import to different ids depending on how the import was generated by another plugin. One way to achieve this would be to rewrite the import to use special proxy ids, e.g. a transpiled import via `require("foo")` in a CommonJS file could become a regular import with a special id `import "foo?require=true"` so that a resolver plugin knows this.

The problem here, however, is that this proxy id may or may not cause unintended side effects when passed to other resolvers because it does not really correspond to a file. Moreover, if the id is created by plugin `A` and the resolution happens in plugin `B`, it creates a dependency between these plugins so that `A` is not usable without `B`.

Custom resolver option offer a solution here by allowing to pass additional options for plugins when manually resolving a module via `this resolve`. This happens without changing the id and thus without impairing the ability for other plugins to resolve the module correctly if the intended target plugin is not present.

```js
function requestingPlugin() {
  return {
    name: 'requesting',
    async buildStart() {
      const resolution = await this.resolve('foo', undefined, {
        custom: { resolving: { specialResolution: true } }
      });
      console.log(resolution.id); // "special"
    }
  };
}

function resolvingPlugin() {
  return {
    name: 'resolving',
    resolveId(id, importer, { custom }) {
      if (custom.resolving?.specialResolution) {
        return 'special';
      }
      return null;
    }
  };
}
```

Note the convention that custom options should be added using a property corresponding to the plugin name of the resolving plugin. It is responsibility of the resolving plugin to specify which options it respects.

#### Custom module meta-data

Plugins can annotate modules with custom meta-data which can be accessed by themselves and other plugins via the [`resolveId`](guide/en/#resolveid), [`load`](guide/en/#load), and [`transform`](guide/en/#transform) hooks. This meta-data should always be JSON.stringifyable and will be persisted in the cache e.g. in watch mode.

```js
function annotatingPlugin() {
  return {
    name: 'annotating',
    transform(code, id) {
      if (thisModuleIsSpecial(code, id)) {
        return { meta: { annotating: { special: true } } };
      }
    }
  };
}

function readingPlugin() {
  let parentApi;
  return {
    name: 'reading',
    buildEnd() {
      const specialModules = Array.from(this.getModuleIds()).filter(
        id => this.getModuleInfo(id).meta.annotating?.special
      );
      // do something with this list
    }
  };
}
```

Note the convention that plugins that add or modify data should use a property corresponding to the plugin name, in this case `annotating`. On the other hand, any plugin can read all meta-data from other plugins via `this.getModuleInfo`.

If several plugins add meta-data or meta-data is added in different hooks, then these `meta` objects will be merged shallowly. That means if plugin `first` adds `{meta: {first: {resolved: "first"}}}` in the resolveId hook and `{meta: {first: {loaded: "first"}}}` in the load hook while plugin `second` adds `{meta: {second: {transformed: "second"}}}` in the `transform` hook, then the resulting `meta` object will be `{first: {loaded: "first"}, second: {transformed: "second"}}`. Here the result of the `resolveId` hook will be overwritten by the result of the `load` hook as the plugin was both storing them under its `first` top-level property. The `transform` data of the other plugin on the other hand will be placed next to it.

#### Direct plugin communication

For any other kind of inter-plugin communication, we recommend the pattern below. Note that `api` will never conflict with any upcoming plugin hooks.

```js
function parentPlugin() {
  return {
    name: 'parent',
    api: {
      //...methods and properties exposed for other plugins
      doSomething(...args) {
        // do something interesting
      }
    }
    // ...plugin hooks
  }
}

function dependentPlugin() {
  let parentApi;
  return {
    name: 'dependent',
    buildStart({ plugins }) {
      const parentName = 'parent';
      const parentPlugin = options.plugins
              .find(plugin => plugin.name === parentName);
      if (!parentPlugin) {
        // or handle this silently if it is optional
        throw new Error(`This plugin depends on the "${parentName}" plugin.`);
      }
      // now you can access the API methods in subsequent hooks
      parentApi = parentPlugin.api;
    }
    transform(code, id) {
      if (thereIsAReasonToDoSomething(id)) {
        parentApi.doSomething(id);
      }
    }
  }
}
```
