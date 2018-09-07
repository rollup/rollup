import * as ESTree from 'estree';
import { EventEmitter } from 'events';

export const VERSION: string;

export interface IdMap {
	[key: string]: string;
}

export interface RollupError extends RollupLogProps {
	message?: string;
	stack?: string;
}

export interface RollupWarning extends RollupLogProps {
	message?: string;
}

export interface RollupLogProps {
	code?: string;
	url?: string;
	plugin?: string;
	pluginCode?: string;
	hook?: string;
	loc?: {
		file?: string;
		line: number;
		column: number;
	};
	frame?: string;
	[key: string]: any;
}

export interface ExistingRawSourceMap {
	version: string;
	sources: string[];
	names: string[];
	sourceRoot?: string;
	sourcesContent?: string[];
	mappings: string;
	file: string;
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

export interface OutputBundle {
	[fileName: string]: OutputAsset | OutputChunk;
}

export interface Plugin {
	name: string;
	cacheKey?: string;
	options?: (options: InputOptions) => InputOptions | void | null;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	transform?: TransformHook;
	/** @deprecated */
	transformBundle?: TransformChunkHook;
	/** @deprecated */
	transformChunk?: TransformChunkHook;
	renderChunk?: RenderChunkHook;
	buildStart?: (this: PluginContext, options: InputOptions) => Promise<void> | void;
	buildEnd?: (this: PluginContext, err?: any) => Promise<void> | void;
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

	experimentalTopLevelAwait?: boolean;

	onwarn?: WarningHandler;
	cache?: false | RollupCache;
	perf?: boolean;
	experimentalCacheExpiry?: number;

	acorn?: {};
	acornInjectPlugins?: Function[];
	treeshake?: boolean | TreeshakingOptions;
	context?: string;
	moduleContext?: string | ((id: string) => string) | { [id: string]: string };
	watch?: WatcherOptions;
	inlineDynamicImports?: boolean;
	preferConst?: boolean;
	preserveSymlinks?: boolean;
	preserveModules?: boolean;
	optimizeChunks?: boolean;
	chunkGroupingSize?: number;
	shimMissingExports?: boolean;
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
	sourcemapFile?: string;
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

	noConflict?: boolean;
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
	fileName: string;
	isEntry: boolean;
	imports: string[];
	exports: string[];
	modules: {
		[id: string]: RenderedModule;
	};
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
