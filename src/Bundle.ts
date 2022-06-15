import Chunk, { RenderedChunkWithPlaceholders } from './Chunk';
import type ExternalModule from './ExternalModule';
import type Graph from './Graph';
import Module from './Module';
import type {
	GetManualChunk,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundle,
	OutputBundleWithPlaceholders,
	WarningHandler
} from './rollup/types';
import { FILE_PLACEHOLDER } from './utils/FileEmitter';
import type { PluginDriver } from './utils/PluginDriver';
import { createAddons } from './utils/addons';
import { getChunkAssignments } from './utils/chunkAssignment';
import commondir from './utils/commondir';
import { createHash } from './utils/crypto';
import {
	errCannotAssignModuleToChunk,
	errChunkInvalid,
	errInvalidOption,
	error
} from './utils/error';
import { sortByExecutionOrder } from './utils/executionOrder';
import { getGenerateCodeSnippets } from './utils/generateCodeSnippets';
import {
	getHashPlaceholderGenerator,
	replacePlaceholders,
	replacePlaceholdersByPosition,
	replacePlaceholdersWithDefaultAndGetPositions,
	replaceSinglePlaceholder
} from './utils/hashPlaceholders';
import { isAbsolute } from './utils/path';
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

	// TODO Lukas extract and clean up
	async generate(isWrite: boolean): Promise<OutputBundle> {
		timeStart('GENERATE', 1);
		const outputBundle: OutputBundleWithPlaceholders = Object.create(null);
		this.pluginDriver.setOutputBundle(outputBundle, this.outputOptions, this.facadeChunkByModule);
		// TODO Lukas clean up by extracting functions in the end
		// TODO Lukas rethink time measuring points
		try {
			await this.pluginDriver.hookParallel('renderStart', [this.outputOptions, this.inputOptions]);

			timeStart('generate chunks', 2);
			const chunks = await this.generateChunks(outputBundle);
			if (chunks.length > 1) {
				validateOptionsForMultiChunkOutput(this.outputOptions, this.inputOptions.onwarn);
			}
			const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));
			timeEnd('generate chunks', 2);

			timeStart('render chunks', 2);
			// generate exports
			for (const chunk of chunks) {
				chunk.generateExports();
			}

			// TODO Lukas addons could now be created per chunk; check if chunks can be generated in parallel first (there used to be problems with internal state)
			const addons = await createAddons(this.outputOptions, this.pluginDriver);
			const snippets = getGenerateCodeSnippets(this.outputOptions);

			// first we reserve room for entry chunks
			for (const chunk of chunks) {
				if (chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint) {
					// reserves name in bundle as side effect
					chunk.getPreliminaryFileName(inputBase);
				}
			}

			// TODO Lukas maybe it is simpler if we start with a mapping preliminary Chunk <-> name
			//  (and placeholder -> chunk) which we pass to each render and always search
			const nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[] = [];
			const chunksByPlaceholder = new Map<
				string,
				RenderedChunkWithPlaceholders & { contentHash: string; positions: Map<number, string> }
			>();
			for (const chunk of chunks) {
				const renderedChunk = await chunk.render(inputBase, addons, snippets, new Set());
				if ('fileName' in renderedChunk) {
					outputBundle[renderedChunk.fileName] = renderedChunk;
				} else {
					const {
						code,
						containedPlaceholders,
						preliminaryFileName: { hashPlaceholder }
					} = renderedChunk;
					if (hashPlaceholder) {
						const hash = createHash();
						const { positions, result } = replacePlaceholdersWithDefaultAndGetPositions(
							code,
							new Set(containedPlaceholders.keys())
						);
						hash.update(result);
						chunksByPlaceholder.set(hashPlaceholder, {
							...renderedChunk,
							contentHash: hash.digest('hex'),
							positions
						});
					} else {
						// TODO Lukas no need to hash, but we still need to replace stuff. Test this!
						nonHashedChunksWithPlaceholders.push(renderedChunk);
					}
				}
			}
			// generate final hashes by placeholder
			const hashesByPlaceholder = new Map<string, string>();
			// TODO Lukas deduplicate with logic in Chunk.render
			for (const [
				placeholder,
				{
					contentHash,
					preliminaryFileName: { fileName }
				}
			] of chunksByPlaceholder) {
				const hash = createHash();
				const hashDependenciesByPlaceholder = new Map<string, string>([[placeholder, contentHash]]);
				for (const [dependencyPlaceholder, dependencyHash] of hashDependenciesByPlaceholder) {
					hash.update(dependencyHash);
					/* TODO Lukas !!do not use contained placeholders, get rid of it
					 * Instead, we pass a growing list of mapping of hashes to chunks around
					 * Also, do not try to render other chunks in render, just get their preliminary names and use those
					 * getPreliminaryFileName does not need parameters if we inject those when creating the chunks
					 * */
					for (const containedPlaceholder of chunksByPlaceholder
						.get(dependencyPlaceholder)!
						.containedPlaceholders.keys()) {
						// When looping over a map, setting an entry only causes a new iteration if the key is new
						hashDependenciesByPlaceholder.set(
							containedPlaceholder,
							chunksByPlaceholder.get(containedPlaceholder)!.contentHash
						);
					}
				}
				// TODO Lukas now determine the file name and update hash if necessary
				let finalFileName: string | undefined;
				let finalHash: string;
				do {
					if (finalFileName) {
						// TODO Lukas test and instead do a hash.update()
						// But as a matter of fact, we need to recreate the entire hash unless we can use copy in Node 14
						throw new Error(`Need to deduplicate hash for ${finalFileName}`);
					}
					finalHash = hash.digest('hex').slice(0, placeholder.length);
					finalFileName = replaceSinglePlaceholder(fileName, placeholder, finalHash);
				} while (outputBundle[finalFileName]);
				outputBundle[finalFileName] = FILE_PLACEHOLDER;
				hashesByPlaceholder.set(placeholder, finalHash.slice(0, placeholder.length));
			}
			// TODO Lukas update content and file names
			// TODO Lukas also replace in sourcemaps
			for (const [
				placeholder,
				{ chunk, code, map, positions, preliminaryFileName }
			] of chunksByPlaceholder) {
				const updatedCode = replacePlaceholdersByPosition(code, positions, hashesByPlaceholder);
				const fileName = replaceSinglePlaceholder(
					preliminaryFileName.fileName,
					placeholder,
					hashesByPlaceholder.get(placeholder)!
				);
				outputBundle[fileName] = chunk.generateOutputChunk(updatedCode, map, hashesByPlaceholder);
			}
			for (const {
				chunk,
				code,
				map,
				preliminaryFileName: { fileName }
			} of nonHashedChunksWithPlaceholders) {
				const updatedCode = replacePlaceholders(code, hashesByPlaceholder);
				outputBundle[fileName] = chunk.generateOutputChunk(updatedCode, map, hashesByPlaceholder);
			}

			timeEnd('render chunks', 2);
		} catch (err: any) {
			await this.pluginDriver.hookParallel('renderError', [err]);
			throw err;
		}
		await this.pluginDriver.hookSeq('generateBundle', [
			this.outputOptions,
			outputBundle as OutputBundle,
			isWrite
		]);
		this.finaliseAssets(outputBundle);

		timeEnd('GENERATE', 1);
		return outputBundle as OutputBundle;
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

	private finaliseAssets(outputBundle: OutputBundleWithPlaceholders): void {
		for (const file of Object.values(outputBundle)) {
			if (this.outputOptions.validate && 'code' in file) {
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
		this.pluginDriver.finaliseAssets();
	}

	private async generateChunks(bundle: OutputBundleWithPlaceholders): Promise<Chunk[]> {
		const { manualChunks } = this.outputOptions;
		const manualChunkAliasByEntry =
			typeof manualChunks === 'object'
				? await this.addManualChunks(manualChunks)
				: this.assignManualChunks(manualChunks);
		const chunks: Chunk[] = [];
		const chunkByModule = new Map<Module, Chunk>();
		const getHashPlaceholder = getHashPlaceholderGenerator();
		for (const { alias, modules } of this.outputOptions.inlineDynamicImports
			? [{ alias: null, modules: getIncludedModules(this.graph.modulesById) }]
			: this.outputOptions.preserveModules
			? getIncludedModules(this.graph.modulesById).map(module => ({
					alias: null,
					modules: [module]
			  }))
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
				this.facadeChunkByModule,
				this.includedNamespaces,
				alias,
				getHashPlaceholder,
				bundle
			);
			chunks.push(chunk);
			for (const module of modules) {
				chunkByModule.set(module, chunk);
			}
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

function getAbsoluteEntryModulePaths(chunks: readonly Chunk[]): string[] {
	const absoluteEntryModulePaths: string[] = [];
	for (const chunk of chunks) {
		for (const entryModule of chunk.entryModules) {
			if (isAbsolute(entryModule.id)) {
				absoluteEntryModulePaths.push(entryModule.id);
			}
		}
	}
	return absoluteEntryModulePaths;
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
	return [...modulesById.values()].filter(
		(module): module is Module =>
			module instanceof Module &&
			(module.isIncluded() || module.info.isEntry || module.includedDynamicImporters.length > 0)
	);
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
