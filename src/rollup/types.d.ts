import * as ESTree from 'estree';
import { EventEmitter } from 'events';

export const VERSION: string;

export interface RollupError extends RollupLogProps {
	stack?: string;
}

export interface RollupWarning extends RollupLogProps {
	exporter?: string;
	exportName?: string;
	guess?: string;
	importer?: string;
	missing?: string;
	modules?: string[];
	names?: string[];
	reexporter?: string;
	source?: string;
	sources?: string[];
}

export interface RollupLogProps {
	code?: string;
	frame?: string;
	hook?: string;
	id?: string;
	loc?: {
		column: number;
		file?: string;
		line: number;
	};
	message: string;
	name?: string;
	plugin?: string;
	pluginCode?: string;
	pos?: number;
	url?: string;
}

export interface ExistingRawSourceMap {
	file?: string;
	mappings: string;
	names: string[];
	sourceRoot?: string;
	sources: string[];
	sourcesContent?: string[];
	version: number;
}

export type RawSourceMap = { mappings: '' } | ExistingRawSourceMap;

export interface SourceMap {
	file: string;
	mappings: string;
	names: string[];
	sources: string[];
	sourcesContent: string[];
	version: string;
	toString(): string;
	toUrl(): string;
}

export interface SourceDescription {
	code: string;
	map?: string | RawSourceMap;
}

export interface TransformSourceDescription extends SourceDescription {
	ast?: ESTree.Program;
	dependencies?: string[];
}

export interface ModuleJSON {
	ast: ESTree.Program;
	code: string;
	// note if plugins use new this.cache to opt-out auto transform cache
	customTransformCache: boolean;
	dependencies: string[];
	id: string;
	originalCode: string;
	originalSourcemap: RawSourceMap | void;
	resolvedIds: ResolvedIdMap;
	sourcemapChain: RawSourceMap[];
	transformAssets: Asset[] | void;
	transformDependencies: string[] | null;
}

export interface Asset {
	fileName: string;
	name: string;
	source: string | Buffer;
}

export interface PluginCache {
	delete(id: string): boolean;
	get<T = any>(id: string): T;
	has(id: string): boolean;
	set<T = any>(id: string, value: T): void;
}

export interface MinimalPluginContext {
	meta: PluginContextMeta;
}

export interface PluginContext extends MinimalPluginContext {
	addWatchFile: (id: string) => void;
	cache: PluginCache;
	getAssetFileName: (assetId: string) => string;
	getModuleInfo: (
		moduleId: string
	) => {
		id: string;
		importedIds: string[];
		isExternal: boolean;
	};
	isExternal: IsExternal;
	moduleIds: IterableIterator<string>;
	parse: (input: string, options: any) => ESTree.Program;
	resolveId: ResolveIdHook;
	setAssetSource: (assetId: string, source: string | Buffer) => void;
	/** @deprecated */
	watcher: EventEmitter;
	emitAsset(name: string, source?: string | Buffer): string;
	error(err: RollupError | string, pos?: { column: number; line: number }): void;
	warn(warning: RollupWarning | string, pos?: { column: number; line: number }): void;
}

export interface PluginContextMeta {
	rollupVersion: string;
}

export interface ResolvedId {
	external?: boolean | void;
	id: string;
}

export type ResolveIdResult = string | false | void | ResolvedId;

export interface ResolvedIdMap {
	[key: string]: ResolvedId;
}

export type ResolveIdHook = (
	this: PluginContext,
	id: string,
	parent: string
) => Promise<ResolveIdResult> | ResolveIdResult;

export type IsExternal = (id: string, parentId: string, isResolved: boolean) => boolean | void;

export type LoadHook = (
	this: PluginContext,
	id: string
) => Promise<SourceDescription | string | null> | SourceDescription | string | null;

export type TransformHook = (
	this: PluginContext,
	code: string,
	id: string
) =>
	| Promise<TransformSourceDescription | string | void>
	| TransformSourceDescription
	| string
	| void;

export type TransformChunkHook = (
	this: PluginContext,
	code: string,
	options: OutputOptions
) =>
	| Promise<{ code: string; map: RawSourceMap } | void>
	| { code: string; map: RawSourceMap }
	| void
	| null;

export type RenderChunkHook = (
	this: PluginContext,
	code: string,
	chunk: RenderedChunk,
	options: OutputOptions
) =>
	| Promise<{ code: string; map: RawSourceMap } | null>
	| { code: string; map: RawSourceMap }
	| string
	| null;

export type ResolveDynamicImportHook = (
	this: PluginContext,
	specifier: string | ESTree.Node,
	parentId: string
) => Promise<string | void> | string | void;

export type ResolveImportMetaHook = (
	this: PluginContext,
	prop: string | null,
	options: { chunkId: string; format: string; moduleId: string }
) => string | void;

export type ResolveAssetUrlHook = (
	this: PluginContext,
	options: {
		assetFileName: string;
		chunkId: string;
		format: string;
		moduleId: string;
		relativeAssetPath: string;
	}
) => string | void;

export type AddonHook = string | ((this: PluginContext) => string | Promise<string>);

/**
 * use this type for plugin annotation
 * @example
 * ```ts
 * interface Options {
 * ...
 * }
 * const myPlugin: PluginImpl<Options> = (options = {}) => { ... }
 * ```
 */
export type PluginImpl<O extends object = object> = (options?: O) => Plugin;

export interface OutputBundle {
	[fileName: string]: OutputAsset | OutputChunk;
}

export interface Plugin {
	banner?: AddonHook;
	buildEnd?: (this: PluginContext, err?: Error) => Promise<void> | void;
	buildStart?: (this: PluginContext, options: InputOptions) => Promise<void> | void;
	cacheKey?: string;
	footer?: AddonHook;
	generateBundle?: (
		this: PluginContext,
		options: OutputOptions,
		bundle: OutputBundle,
		isWrite: boolean
	) => void | Promise<void>;
	intro?: AddonHook;
	load?: LoadHook;
	name: string;
	/** @deprecated */
	ongenerate?: (
		this: PluginContext,
		options: OutputOptions,
		chunk: OutputChunk
	) => void | Promise<void>;
	/** @deprecated */
	onwrite?: (
		this: PluginContext,
		options: OutputOptions,
		chunk: OutputChunk
	) => void | Promise<void>;
	options?: (this: MinimalPluginContext, options: InputOptions) => InputOptions | void | null;
	outputOptions?: (this: PluginContext, options: OutputOptions) => OutputOptions | void | null;
	outro?: AddonHook;
	renderChunk?: RenderChunkHook;
	renderError?: (this: PluginContext, err?: Error) => Promise<void> | void;
	renderStart?: (this: PluginContext) => Promise<void> | void;
	resolveAssetUrl?: ResolveAssetUrlHook;
	resolveDynamicImport?: ResolveDynamicImportHook;
	resolveId?: ResolveIdHook;
	resolveImportMeta?: ResolveImportMetaHook;
	transform?: TransformHook;
	/** @deprecated */
	transformBundle?: TransformChunkHook;
	/** @deprecated */
	transformChunk?: TransformChunkHook;
	watchChange?: (id: string) => void;
	writeBundle?: (this: PluginContext, bundle: OutputBundle) => void | Promise<void>;
}

export interface TreeshakingOptions {
	annotations?: boolean;
	propertyReadSideEffects?: boolean;
	pureExternalModules?: boolean;
}

export type ExternalOption = string[] | IsExternal;
export type GlobalsOption = { [name: string]: string } | ((name: string) => string);
export type InputOption = string | string[] | { [entryAlias: string]: string };

export interface InputOptions {
	acorn?: any;
	acornInjectPlugins?: Function[];
	cache?: false | RollupCache;
	chunkGroupingSize?: number;
	context?: string;
	experimentalCacheExpiry?: number;
	experimentalOptimizeChunks?: boolean;
	experimentalTopLevelAwait?: boolean;
	external?: ExternalOption;
	inlineDynamicImports?: boolean;
	input: InputOption;
	manualChunks?: { [chunkAlias: string]: string[] };
	moduleContext?: ((id: string) => string) | { [id: string]: string };
	onwarn?: WarningHandler;
	perf?: boolean;
	plugins?: Plugin[];
	preserveModules?: boolean;
	preserveSymlinks?: boolean;
	shimMissingExports?: boolean;
	treeshake?: boolean | TreeshakingOptions;
	watch?: WatcherOptions;
}

export type ModuleFormat =
	| 'amd'
	| 'cjs'
	| 'commonjs'
	| 'es'
	| 'esm'
	| 'iife'
	| 'module'
	| 'system'
	| 'umd';

export type OptionsPaths = Record<string, string> | ((id: string) => string);

export interface OutputOptions {
	amd?: {
		define?: string;
		id?: string;
	};
	assetFileNames?: string;
	banner?: string | (() => string | Promise<string>);
	chunkFileNames?: string;
	compact?: boolean;
	// only required for bundle.write
	dir?: string;
	dynamicImportFunction?: string;
	entryFileNames?: string;
	esModule?: boolean;
	exports?: 'default' | 'named' | 'none' | 'auto';
	extend?: boolean;
	// only required for bundle.write
	file?: string;
	footer?: string | (() => string | Promise<string>);
	// this is optional at the base-level of RollupWatchOptions,
	// which extends from this interface through config merge
	format?: ModuleFormat;
	freeze?: boolean;
	globals?: GlobalsOption;
	importMetaUrl?: (chunkId: string, moduleId: string) => string;
	indent?: boolean;
	interop?: boolean;
	intro?: string | (() => string | Promise<string>);
	name?: string;
	namespaceToStringTag?: boolean;
	noConflict?: boolean;
	outro?: string | (() => string | Promise<string>);
	paths?: OptionsPaths;
	preferConst?: boolean;
	sourcemap?: boolean | 'inline';
	sourcemapExcludeSources?: boolean;
	sourcemapFile?: string;
	sourcemapPathTransform?: (sourcePath: string) => string;
	strict?: boolean;
}

export type WarningHandler = (warning: string | RollupWarning) => void;

export interface SerializedTimings {
	[label: string]: [number, number, number];
}

export interface OutputAsset {
	code?: undefined;
	fileName: string;
	isAsset: true;
	source: string | Buffer;
}

export interface RenderedModule {
	originalLength: number;
	removedExports: string[];
	renderedExports: string[];
	renderedLength: number;
}

export interface RenderedChunk {
	dynamicImports: string[];
	exports: string[];
	facadeModuleId: string | null;
	fileName: string;
	imports: string[];
	isDynamicEntry: boolean;
	isEntry: boolean;
	modules: {
		[id: string]: RenderedModule;
	};
	name: string;
}

export interface OutputChunk extends RenderedChunk {
	code: string;
	map?: SourceMap;
}

export interface SerializablePluginCache {
	[key: string]: [number, any];
}

export interface RollupCache {
	// to be deprecated
	modules?: ModuleJSON[];
	plugins?: Record<string, SerializablePluginCache>;
}

export interface RollupOutput {
	output: [OutputChunk, ...(OutputChunk | OutputAsset)[]];
}

export interface RollupBuild {
	cache: RollupCache;
	generate: (outputOptions: OutputOptions) => Promise<RollupOutput>;
	getTimings?: () => SerializedTimings;
	watchFiles: string[];
	write: (options: OutputOptions) => Promise<RollupOutput>;
}

export interface RollupOptions extends InputOptions {
	output?: OutputOptions;
}

export function rollup(options: RollupOptions): Promise<RollupBuild>;
// chokidar watch options
export interface WatchOptions {
	alwaysStat?: boolean;
	atomic?: boolean | number;
	awaitWriteFinish?:
		| {
				pollInterval?: number;
				stabilityThreshold?: number;
		  }
		| boolean;
	binaryInterval?: number;
	cwd?: string;
	depth?: number;
	disableGlobbing?: boolean;
	followSymlinks?: boolean;
	ignored?: any;
	ignoreInitial?: boolean;
	ignorePermissionErrors?: boolean;
	interval?: number;
	persistent?: boolean;
	useFsEvents?: boolean;
	usePolling?: boolean;
}

export interface WatcherOptions {
	chokidar?: boolean | WatchOptions;
	clearScreen?: boolean;
	exclude?: string[];
	include?: string[];
}

export interface RollupWatchOptions extends InputOptions {
	output?: OutputOptions | OutputOptions[];
	watch?: WatcherOptions;
}

export interface RollupWatcher extends EventEmitter {
	close(): void;
}

export function watch(configs: RollupWatchOptions[]): RollupWatcher;
