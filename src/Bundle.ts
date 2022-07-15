import Chunk from './Chunk';
import ExternalChunk from './ExternalChunk';
import ExternalModule from './ExternalModule';
import type Graph from './Graph';
import Module from './Module';
import type {
	GetManualChunk,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundle,
	WarningHandler
} from './rollup/types';
import type { PluginDriver } from './utils/PluginDriver';
import { getChunkAssignments } from './utils/chunkAssignment';
import commondir from './utils/commondir';
import {
	errCannotAssignModuleToChunk,
	errChunkInvalid,
	errInvalidOption,
	error
} from './utils/error';
import { sortByExecutionOrder } from './utils/executionOrder';
import { getGenerateCodeSnippets } from './utils/generateCodeSnippets';
import { getHashPlaceholderGenerator, HashPlaceholderGenerator } from './utils/hashPlaceholders';
import { getOutputBundle, OutputBundleWithPlaceholders } from './utils/outputBundle';
import { isAbsolute } from './utils/path';
import { renderChunks } from './utils/renderChunks';
import { timeEnd, timeStart } from './utils/timers';

export default class Bundle {
	private readonly facadeChunkByModule = new Map<Module, Chunk>();
	private readonly includedNamespaces = new Set<Module>();

	constructor(
		private readonly outputOptions: NormalizedOutputOptions,
		private readonly unsetOptions: ReadonlySet<string>,
		private readonly inputOptions: NormalizedInputOptions,
		private readonly pluginDriver: PluginDriver,
		private readonly graph: Graph
	) {}

	async generate(isWrite: boolean): Promise<OutputBundle> {
		timeStart('GENERATE', 1);
		const outputBundleBase: OutputBundle = Object.create(null);
		const outputBundle = getOutputBundle(outputBundleBase);
		this.pluginDriver.setOutputBundle(outputBundle, this.outputOptions);

		try {
			timeStart('initialize render', 2);

			await this.pluginDriver.hookParallel('renderStart', [this.outputOptions, this.inputOptions]);

			timeEnd('initialize render', 2);
			timeStart('generate chunks', 2);

			const getHashPlaceholder = getHashPlaceholderGenerator();
			const chunks = await this.generateChunks(outputBundle, getHashPlaceholder);
			if (chunks.length > 1) {
				validateOptionsForMultiChunkOutput(this.outputOptions, this.inputOptions.onwarn);
			}
			this.pluginDriver.setChunkInformation(this.facadeChunkByModule);
			for (const chunk of chunks) {
				chunk.generateExports();
			}

			timeEnd('generate chunks', 2);

			await renderChunks(
				chunks,
				outputBundle,
				this.pluginDriver,
				this.outputOptions,
				this.inputOptions.onwarn
			);
		} catch (err: any) {
			await this.pluginDriver.hookParallel('renderError', [err]);
			throw err;
		}

		timeStart('generate bundle', 2);

		await this.pluginDriver.hookSeq('generateBundle', [
			this.outputOptions,
			outputBundle as OutputBundle,
			isWrite
		]);
		this.finaliseAssets(outputBundle);

		timeEnd('generate bundle', 2);
		timeEnd('GENERATE', 1);
		return outputBundleBase;
	}

	private async addManualChunks(
		manualChunks: Record<string, readonly string[]>
	): Promise<Map<Module, string>> {
		const manualChunkAliasByEntry = new Map<Module, string>();
		const chunkEntries = await Promise.all(
			Object.entries(manualChunks).map(async ([alias, files]) => ({
				alias,
				entries: await this.graph.moduleLoader.addAdditionalModules(files)
			}))
		);
		for (const { alias, entries } of chunkEntries) {
			for (const entry of entries) {
				addModuleToManualChunk(alias, entry, manualChunkAliasByEntry);
			}
		}
		return manualChunkAliasByEntry;
	}

	private assignManualChunks(getManualChunk: GetManualChunk): Map<Module, string> {
		const manualChunkAliasesWithEntry: [alias: string, module: Module][] = [];
		const manualChunksApi = {
			getModuleIds: () => this.graph.modulesById.keys(),
			getModuleInfo: this.graph.getModuleInfo
		};
		for (const module of this.graph.modulesById.values()) {
			if (module instanceof Module) {
				const manualChunkAlias = getManualChunk(module.id, manualChunksApi);
				if (typeof manualChunkAlias === 'string') {
					manualChunkAliasesWithEntry.push([manualChunkAlias, module]);
				}
			}
		}
		manualChunkAliasesWithEntry.sort(([aliasA], [aliasB]) =>
			aliasA > aliasB ? 1 : aliasA < aliasB ? -1 : 0
		);
		const manualChunkAliasByEntry = new Map<Module, string>();
		for (const [alias, module] of manualChunkAliasesWithEntry) {
			addModuleToManualChunk(alias, module, manualChunkAliasByEntry);
		}
		return manualChunkAliasByEntry;
	}

	private finaliseAssets(bundle: OutputBundleWithPlaceholders): void {
		if (this.outputOptions.validate) {
			for (const file of Object.values(bundle)) {
				if ('code' in file) {
					try {
						this.graph.contextParse(file.code, {
							allowHashBang: true,
							ecmaVersion: 'latest'
						});
					} catch (err: any) {
						this.inputOptions.onwarn(errChunkInvalid(file, err));
					}
				}
			}
		}
		this.pluginDriver.finaliseAssets();
	}

	private async generateChunks(
		bundle: OutputBundleWithPlaceholders,
		getHashPlaceholder: HashPlaceholderGenerator
	): Promise<Chunk[]> {
		const { inlineDynamicImports, manualChunks, preserveModules } = this.outputOptions;
		const manualChunkAliasByEntry =
			typeof manualChunks === 'object'
				? await this.addManualChunks(manualChunks)
				: this.assignManualChunks(manualChunks);
		const snippets = getGenerateCodeSnippets(this.outputOptions);
		const includedModules = getIncludedModules(this.graph.modulesById);
		const inputBase = commondir(getAbsoluteEntryModulePaths(includedModules, preserveModules));
		const externalChunkByModule = getExternalChunkByModule(
			this.graph.modulesById,
			this.outputOptions,
			inputBase
		);
		const chunks: Chunk[] = [];
		const chunkByModule = new Map<Module, Chunk>();
		for (const { alias, modules } of inlineDynamicImports
			? [{ alias: null, modules: includedModules }]
			: preserveModules
			? includedModules.map(module => ({ alias: null, modules: [module] }))
			: getChunkAssignments(this.graph.entryModules, manualChunkAliasByEntry)) {
			sortByExecutionOrder(modules);
			const chunk = new Chunk(
				modules,
				this.inputOptions,
				this.outputOptions,
				this.unsetOptions,
				this.pluginDriver,
				this.graph.modulesById,
				chunkByModule,
				externalChunkByModule,
				this.facadeChunkByModule,
				this.includedNamespaces,
				alias,
				getHashPlaceholder,
				bundle,
				inputBase,
				snippets
			);
			chunks.push(chunk);
		}
		for (const chunk of chunks) {
			chunk.link();
		}
		const facades: Chunk[] = [];
		for (const chunk of chunks) {
			facades.push(...chunk.generateFacades());
		}
		return [...chunks, ...facades];
	}
}

function validateOptionsForMultiChunkOutput(
	outputOptions: NormalizedOutputOptions,
	onWarn: WarningHandler
) {
	if (outputOptions.format === 'umd' || outputOptions.format === 'iife')
		return error(
			errInvalidOption(
				'output.format',
				'outputformat',
				'UMD and IIFE output formats are not supported for code-splitting builds',
				outputOptions.format
			)
		);
	if (typeof outputOptions.file === 'string')
		return error(
			errInvalidOption(
				'output.file',
				'outputdir',
				'when building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option'
			)
		);
	if (outputOptions.sourcemapFile)
		return error(
			errInvalidOption(
				'output.sourcemapFile',
				'outputsourcemapfile',
				'"output.sourcemapFile" is only supported for single-file builds'
			)
		);
	if (!outputOptions.amd.autoId && outputOptions.amd.id)
		onWarn(
			errInvalidOption(
				'output.amd.id',
				'outputamd',
				'this option is only properly supported for single-file builds. Use "output.amd.autoId" and "output.amd.basePath" instead'
			)
		);
}

function getIncludedModules(modulesById: ReadonlyMap<string, Module | ExternalModule>): Module[] {
	const includedModules: Module[] = [];
	for (const module of modulesById.values()) {
		if (
			module instanceof Module &&
			(module.isIncluded() || module.info.isEntry || module.includedDynamicImporters.length > 0)
		) {
			includedModules.push(module);
		}
	}
	return includedModules;
}

function getAbsoluteEntryModulePaths(
	includedModules: Module[],
	preserveModules: boolean
): string[] {
	const absoluteEntryModulePaths: string[] = [];
	for (const module of includedModules) {
		if ((module.info.isEntry || preserveModules) && isAbsolute(module.id)) {
			absoluteEntryModulePaths.push(module.id);
		}
	}
	return absoluteEntryModulePaths;
}

function getExternalChunkByModule(
	modulesById: ReadonlyMap<string, Module | ExternalModule>,
	outputOptions: NormalizedOutputOptions,
	inputBase: string
): Map<ExternalModule, ExternalChunk> {
	const externalChunkByModule = new Map<ExternalModule, ExternalChunk>();
	for (const module of modulesById.values()) {
		if (module instanceof ExternalModule) {
			externalChunkByModule.set(module, new ExternalChunk(module, outputOptions, inputBase));
		}
	}
	return externalChunkByModule;
}

function addModuleToManualChunk(
	alias: string,
	module: Module,
	manualChunkAliasByEntry: Map<Module, string>
): void {
	const existingAlias = manualChunkAliasByEntry.get(module);
	if (typeof existingAlias === 'string' && existingAlias !== alias) {
		return error(errCannotAssignModuleToChunk(module.id, alias, existingAlias));
	}
	manualChunkAliasByEntry.set(module, alias);
}
