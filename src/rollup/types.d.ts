import * as ESTree from 'estree';
import { EventEmitter } from 'events';

export const VERSION: string;

export interface IdMap {
	[key: string]: string;
}

export interface RollupError extends RollupLogProps {
	stack?: string;
}

export interface RollupWarning extends RollupLogProps {
	code: string;
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
		file?: string;
		line: number;
		column: number;
	};
	message: string;
	name?: string;
	plugin?: string;
	pluginCode?: string;
	pos?: number;
	url?: string;
}

export interface ExistingRawSourceMap {
	version: number;
	sources: string[];
	names: string[];
	sourceRoot?: string;
	sourcesContent?: string[];
	mappings: string;
	file?: string;
}

export type RawSourceMap = { mappings: '' } | ExistingRawSourceMap;

export interface SourceMap {
	version: string;
	file: string;
	sources: string[];
	sourcesContent: string[];
	names: string[];
	mappings: string;

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
	id: string;
	dependencies: string[];
	transformDependencies: string[] | null;
	transformAssets: Asset[] | void;
	code: string;
	originalCode: string;
	originalSourcemap: RawSourceMap | void;
	ast: ESTree.Program;
	sourcemapChain: RawSourceMap[];
	resolvedIds: IdMap;
	// note if plugins use new this.cache to opt-out auto transform cache
	customTransformCache: boolean;
}

export interface Asset {
	name: string;
	source: string | Buffer;
	fileName: string;
}

export interface PluginCache {
	has(id: string): boolean;
	get<T = any>(id: string): T;
	set<T = any>(id: string, value: T): void;
	delete(id: string): boolean;
}

export interface PluginContext {
	/** @deprecated */
	watcher: EventEmitter;
	addWatchFile: (id: string) => void;
	cache: PluginCache;
	resolveId: ResolveIdHook;
	isExternal: IsExternal;
	meta: PluginContextMeta;
	parse: (input: string, options: any) => ESTree.Program;
	emitAsset(name: string, source?: string | Buffer): string;
	setAssetSource: (assetId: string, source: string | Buffer) => void;
	getAssetFileName: (assetId: string) => string;
	warn(warning: RollupWarning | string, pos?: { line: number; column: number }): void;
	error(err: RollupError | string, pos?: { line: number; column: number }): void;
	moduleIds: IterableIterator<string>;
	getModuleInfo: (
		moduleId: string
	) => {
		id: string;
		isExternal: boolean;
		importedIds: string[];
	};
}

export interface PluginContextMeta {
	rollupVersion: string;
}

export type ResolveIdHook = (
	this: PluginContext,
	id: string,
	parent: string
) => Promise<string | false | null> | string | false | void | null;

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
	options?: (options: InputOptions) => InputOptions | void | null;
	outro?: AddonHook;
	renderChunk?: RenderChunkHook;
	renderError?: (this: PluginContext, err?: Error) => Promise<void> | void;
	renderStart?: (this: PluginContext) => Promise<void> | void;
	resolveDynamicImport?: ResolveDynamicImportHook;
	resolveId?: ResolveIdHook;
	transform?: TransformHook;
	/** @deprecated */
	transformBundle?: TransformChunkHook;
	/** @deprecated */
	transformChunk?: TransformChunkHook;
	watchChange?: (id: string) => void;
}

export interface TreeshakingOptions {
	propertyReadSideEffects: boolean;
	pureExternalModules: boolean;
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

export type ModuleFormat = 'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd';

export type OptionsPaths = Record<string, string> | ((id: string) => string);

export interface OutputOptions {
	amd?: {
		id?: string;
		define?: string;
	};
	assetFileNames?: string;
	banner?: string | (() => string | Promise<string>);
	chunkFileNames?: string;
	compact?: boolean;
	// only required for bundle.write
	dir?: string;
	exports?: 'default' | 'named' | 'none' | 'auto';
	entryFileNames?: string;
	esModule?: boolean;
	extend?: boolean;
	// only required for bundle.write
	file?: string;
	footer?: string | (() => string | Promise<string>);
	// this is optional at the base-level of RollupWatchOptions,
	// which extends from this interface through config merge
	format?: ModuleFormat;
	freeze?: boolean;
	globals?: GlobalsOption;
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
	isAsset: true;
	code?: undefined;
	fileName: string;
	source: string | Buffer;
}

export interface RenderedModule {
	renderedExports: string[];
	removedExports: string[];
	renderedLength: number;
	originalLength: number;
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
	// when supported in TypeScript (https://github.com/Microsoft/TypeScript/pull/24897):
	// output: [OutputChunk, ...(OutputChunk | OutputAsset)[]];
	output: (OutputChunk | OutputAsset)[];
}

export interface RollupBuild {
	cache: RollupCache;
	watchFiles: string[];
	generate: (outputOptions: OutputOptions) => Promise<RollupOutput>;
	write: (options: OutputOptions) => Promise<RollupOutput>;
	getTimings?: () => SerializedTimings;
}

export interface RollupOptions extends InputOptions {
	cache?: RollupCache;
	input: string | string[] | { [entryName: string]: string };
	output?: OutputOptions;
}

export function rollup(options: RollupOptions): Promise<RollupBuild>;
// chokidar watch options
export interface WatchOptions {
	persistent?: boolean;
	ignored?: any;
	ignoreInitial?: boolean;
	followSymlinks?: boolean;
	cwd?: string;
	disableGlobbing?: boolean;
	usePolling?: boolean;
	useFsEvents?: boolean;
	alwaysStat?: boolean;
	depth?: number;
	interval?: number;
	binaryInterval?: number;
	ignorePermissionErrors?: boolean;
	atomic?: boolean | number;
	awaitWriteFinish?:
		| {
				stabilityThreshold?: number;
				pollInterval?: number;
		  }
		| boolean;
}

export interface WatcherOptions {
	chokidar?: boolean | WatchOptions;
	include?: string[];
	exclude?: string[];
	clearScreen?: boolean;
}

export interface RollupWatchOptions extends InputOptions {
	output?: OutputOptions | OutputOptions[];
	watch?: WatcherOptions;
}

export interface RollupWatcher extends EventEmitter {
	close(): void;
}

export function watch(configs: RollupWatchOptions[]): RollupWatcher;
