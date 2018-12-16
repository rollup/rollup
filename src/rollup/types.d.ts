import * as ESTree from 'estree';
import { EventEmitter } from 'events';

export const VERSION: string;

export interface IdMap {
	[key: string]: string;
}

export interface RollupError {
	message: string;
	code?: string;
	name?: string;
	url?: string;
	id?: string;
	loc?: {
		file?: string;
		line: number;
		column: number;
	};
	stack?: string;
	frame?: string;
	pos?: number;
	plugin?: string;
	pluginCode?: string;
	hook?: string;
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
	// TODO deprecate:
	watcher: Watcher;
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
) => Promise<string | boolean | void | null> | string | boolean | void | null;

export type IsExternal = (id: string, parentId: string, isResolved: boolean) => boolean | void;

export type LoadHook = (
	this: PluginContext,
	id: string
) => Promise<SourceDescription | string | void | null> | SourceDescription | string | void | null;

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
	| Promise<{ code: string; map: RawSourceMap } | void>
	| { code: string; map: RawSourceMap }
	| void
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

export interface Plugin {
	name: string;
	cacheKey?: string;
	options?: (options: InputOptions) => InputOptions | void | null;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	transform?: TransformHook;
	// TODO: deprecate
	transformBundle?: TransformChunkHook;
	transformChunk?: TransformChunkHook;
	renderChunk?: RenderChunkHook;
	buildStart?: (this: PluginContext, options: InputOptions) => Promise<void> | void;
	buildEnd?: (this: PluginContext, err?: any) => Promise<void> | void;
	// TODO: deprecate
	ongenerate?: (
		this: PluginContext,
		options: OutputOptions,
		chunk: OutputChunk
	) => void | Promise<void>;
	// TODO: deprecate
	onwrite?: (
		this: PluginContext,
		options: OutputOptions,
		chunk: OutputChunk
	) => void | Promise<void>;
	generateBundle?: (
		this: PluginContext,
		options: OutputOptions,
		bundle: OutputBundle,
		isWrite: boolean
	) => void | Promise<void>;
	resolveDynamicImport?: ResolveDynamicImportHook;
	banner?: AddonHook;
	footer?: AddonHook;
	intro?: AddonHook;
	outro?: AddonHook;
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
	input: InputOption;
	manualChunks?: { [chunkAlias: string]: string[] };
	external?: ExternalOption;
	plugins?: Plugin[];

	onwarn?: WarningHandler;
	cache?: false | RollupCache;
	experimentalCacheExpiry?: number;

	acorn?: {};
	acornInjectPlugins?: Function[];
	treeshake?: boolean | TreeshakingOptions;
	context?: string;
	moduleContext?: string | ((id: string) => string) | { [id: string]: string };
	watch?: WatcherOptions;
	experimentalCodeSplitting?: boolean;
	experimentalTopLevelAwait?: boolean;
	inlineDynamicImports?: boolean;
	preserveSymlinks?: boolean;
	experimentalPreserveModules?: boolean;
	experimentalOptimizeChunks?: boolean;
	chunkGroupingSize?: number;
	shimMissingExports?: boolean;

	// undocumented?
	pureExternalModules?: boolean;
	preferConst?: boolean;
	perf?: boolean;

	/** @deprecated */
	entry?: string;
	transform?: TransformHook;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	resolveExternal?: any;
}

export type ModuleFormat = 'amd' | 'cjs' | 'system' | 'es' | 'esm' | 'iife' | 'umd';

export type OptionsPaths = Record<string, string> | ((id: string) => string);

export interface OutputOptions {
	// only required for bundle.write
	file?: string;
	// only required for bundles.write
	dir?: string;
	// this is optional at the base-level of RollupWatchOptions,
	// which extends from this interface through config merge
	format?: ModuleFormat;
	name?: string;
	globals?: GlobalsOption;
	chunkFileNames?: string;
	entryFileNames?: string;
	assetFileNames?: string;

	paths?: OptionsPaths;
	banner?: string | (() => string | Promise<string>);
	footer?: string | (() => string | Promise<string>);
	intro?: string | (() => string | Promise<string>);
	outro?: string | (() => string | Promise<string>);
	sourcemap?: boolean | 'inline';
	sourcemapExcludeSources?: boolean;
	sourcemapFile?: string;
	sourcemapPathTransform?: (sourcePath: string) => string;
	interop?: boolean;
	extend?: boolean;

	exports?: 'default' | 'named' | 'none' | 'auto';
	amd?: {
		id?: string;
		define?: string;
	};
	indent?: boolean;
	strict?: boolean;
	freeze?: boolean;
	esModule?: boolean;
	namespaceToStringTag?: boolean;
	compact?: boolean;

	// undocumented?
	noConflict?: boolean;

	// deprecated
	dest?: string;
	moduleId?: string;
}

export interface OutputOptionsFile extends OutputOptions {
	file?: string;
}

export interface OutputOptionsDir extends OutputOptions {
	// only required for bundles.write
	dir?: string;
}

export interface RollupWarning {
	message?: string;
	code?: string;
	loc?: {
		file: string;
		line: number;
		column: number;
	};
	deprecations?: { old: string; new: string }[];
	modules?: string[];
	names?: string[];
	source?: string;
	importer?: string;
	frame?: any;
	missing?: string;
	exporter?: string;
	exportName?: string;
	name?: string;
	sources?: string[];
	reexporter?: string;
	guess?: string;
	url?: string;
	id?: string;
	plugin?: string;
	pos?: number;
	pluginCode?: string;
	hook?: string;
}

export type WarningHandler = (warning: string | RollupWarning) => void;

export interface SerializedTimings {
	[label: string]: [number, number, number];
}

export type OutputFile = string | Buffer | OutputChunk;

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

export interface RollupSingleFileBuild {
	// TODO: consider deprecating to match code splitting
	imports: string[];
	exports: { name: string; originalName: string; moduleId: string }[];
	modules: ModuleJSON[];
	cache: RollupCache;
	watchFiles: string[];

	generate: (outputOptions: OutputOptions) => Promise<OutputChunk>;
	write: (options: OutputOptions) => Promise<OutputChunk>;
	getTimings?: () => SerializedTimings;
}

export interface OutputBundle {
	[fileName: string]: OutputChunk | OutputFile;
}

export interface RollupBuild {
	cache: RollupCache;
	watchFiles: string[];
	generate: (outputOptions: OutputOptions) => Promise<{ output: OutputBundle }>;
	write: (options: OutputOptions) => Promise<{ output: OutputBundle }>;
	getTimings?: () => SerializedTimings;
}

export interface RollupFileOptions extends InputOptions {
	cache?: RollupCache;
	input: string;
	output?: OutputOptionsFile;
}

export interface RollupDirOptions extends InputOptions {
	cache?: RollupCache;
	input: string[] | { [entryName: string]: string };
	output?: OutputOptionsDir;
}

export function rollup(options: RollupFileOptions): Promise<RollupSingleFileBuild>;
export function rollup(options: RollupDirOptions): Promise<RollupBuild>;

export interface Watcher extends EventEmitter {}

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

export function watch(configs: RollupWatchOptions[]): Watcher;
