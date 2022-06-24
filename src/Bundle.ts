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
import { RenderedChunk } from './rollup/types';
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
	HashPlaceholderGenerator,
	replacePlaceholders,
	replacePlaceholdersWithDefaultAndGetContainedPlaceholders,
	replaceSinglePlaceholder
} from './utils/hashPlaceholders';
import { isAbsolute } from './utils/path';
import { timeEnd, timeStart } from './utils/timers';

type HashDependenciesByPlaceholder = Map<
	string,
	{ containedPlaceholders: Set<string>; contentHash: string }
>;

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
		this.pluginDriver.setOutputBundle(outputBundle, this.outputOptions);

		// TODO Lukas clean up by extracting functions in the end
		// TODO Lukas rethink time measuring points
		try {
			await this.pluginDriver.hookParallel('renderStart', [this.outputOptions, this.inputOptions]);

			timeStart('generate chunks', 2);
			const { chunksByPlaceholder, getHashPlaceholder } = getHashPlaceholderGenerator();
			const chunks = await this.generateChunks(outputBundle, getHashPlaceholder);
			if (chunks.length > 1) {
				validateOptionsForMultiChunkOutput(this.outputOptions, this.inputOptions.onwarn);
			}
			const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));
			this.pluginDriver.setChunkInformation(this.facadeChunkByModule, inputBase);

			timeEnd('generate chunks', 2);

			timeStart('render chunks', 2);
			// generate exports
			for (const chunk of chunks) {
				chunk.generateExports();
			}

			// TODO Lukas addons could now be created per chunk
			const addons = await createAddons(this.outputOptions, this.pluginDriver);
			const snippets = getGenerateCodeSnippets(this.outputOptions);

			// first we reserve room for entry chunks
			for (const chunk of chunks) {
				if (chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint) {
					// reserves name in bundle as side effect
					chunk.getPreliminaryFileName(inputBase);
				}
			}

			// TODO Lukas in the end, we could speed up things if we check if no placeholders were generated in that case we skip some stuff
			const nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[] = [];
			const renderedChunksByPlaceholder = new Map<string, RenderedChunkWithPlaceholders>();

			// render the chunks
			const renderedChunks = chunks.map(chunk => chunk.render(inputBase, addons, snippets));

			// generate chunk graph info for renderChunk
			const renderedChunkInfos: Record<string, RenderedChunk> = Object.fromEntries(
				chunks.map(chunk => {
					const renderedChunkInfo = chunk.getRenderedChunkInfo(
						inputBase,
						snippets.getPropertyAccess
					);
					return [renderedChunkInfo.fileName, renderedChunkInfo];
				})
			);

			const hashDependenciesByPlaceholder: HashDependenciesByPlaceholder = new Map();
			await Promise.all(
				renderedChunks.map(async ({ chunk, magicString, usedModules }) => {
					const transformedChunk = await chunk.transform(
						magicString,
						usedModules,
						renderedChunkInfos,
						inputBase,
						snippets.getPropertyAccess
					);
					const {
						code,
						preliminaryFileName: { hashPlaceholder }
					} = transformedChunk;
					if (hashPlaceholder) {
						const hash = createHash();
						// To create a reproducible content-only hash, all placeholders are
						// replaced with the same value before hashing
						const { containedPlaceholders, transformedCode } =
							replacePlaceholdersWithDefaultAndGetContainedPlaceholders(code, chunksByPlaceholder);
						hash.update(transformedCode);
						const hashAugmentation = this.pluginDriver.hookReduceValueSync(
							'augmentChunkHash',
							'',
							[chunk.getRenderedChunkInfo(inputBase, snippets.getPropertyAccess)],
							(augmentation, pluginHash) => {
								if (pluginHash) {
									augmentation += pluginHash;
								}
								return augmentation;
							}
						);
						if (hashAugmentation) {
							hash.update(hashAugmentation);
						}
						renderedChunksByPlaceholder.set(hashPlaceholder, transformedChunk);
						hashDependenciesByPlaceholder.set(hashPlaceholder, {
							containedPlaceholders,
							contentHash: hash.digest('hex')
						});
					} else {
						nonHashedChunksWithPlaceholders.push(transformedChunk);
					}
				})
			);

			// generate final hashes by placeholder
			const hashesByPlaceholder = new Map<string, string>();
			for (const [
				placeholder,
				{
					preliminaryFileName: { fileName }
				}
			] of renderedChunksByPlaceholder) {
				let hash = createHash();
				const hashDependencyPlaceholders = new Set<string>([placeholder]);
				for (const dependencyPlaceholder of hashDependencyPlaceholders) {
					const { containedPlaceholders, contentHash } =
						hashDependenciesByPlaceholder.get(dependencyPlaceholder)!;
					hash.update(contentHash);
					for (const containedPlaceholder of containedPlaceholders) {
						// When looping over a map, setting an entry only causes a new iteration if the key is new
						hashDependencyPlaceholders.add(containedPlaceholder);
					}
				}
				let finalFileName: string | undefined;
				let finalHash: string | undefined;
				do {
					// In case of a hash collision, create a hash of the hash
					if (finalHash) {
						hash = createHash();
						hash.update(finalHash);
					}
					finalHash = hash.digest('hex').slice(0, placeholder.length);
					finalFileName = replaceSinglePlaceholder(fileName, placeholder, finalHash);
				} while (outputBundle[finalFileName]);
				outputBundle[finalFileName] = FILE_PLACEHOLDER;
				hashesByPlaceholder.set(placeholder, finalHash.slice(0, placeholder.length));
			}
			// TODO Lukas also replace in sourcemaps
			for (const [
				placeholder,
				{ chunk, code, map, preliminaryFileName }
			] of renderedChunksByPlaceholder) {
				const updatedCode = replacePlaceholders(code, hashesByPlaceholder);
				const fileName = replaceSinglePlaceholder(
					preliminaryFileName.fileName,
					placeholder,
					hashesByPlaceholder.get(placeholder)!
				);
				outputBundle[fileName] = chunk.generateOutputChunk(
					updatedCode,
					map,
					hashesByPlaceholder,
					inputBase,
					snippets.getPropertyAccess
				);
			}
			for (const {
				chunk,
				code,
				map,
				preliminaryFileName: { fileName }
			} of nonHashedChunksWithPlaceholders) {
				const updatedCode = hashesByPlaceholder.size
					? replacePlaceholders(code, hashesByPlaceholder)
					: code;
				outputBundle[fileName] = chunk.generateOutputChunk(
					updatedCode,
					map,
					hashesByPlaceholder,
					inputBase,
					snippets.getPropertyAccess
				);
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

	private async generateChunks(
		bundle: OutputBundleWithPlaceholders,
		getHashPlaceholder: HashPlaceholderGenerator
	): Promise<Chunk[]> {
		const { manualChunks } = this.outputOptions;
		const manualChunkAliasByEntry =
			typeof manualChunks === 'object'
				? await this.addManualChunks(manualChunks)
				: this.assignManualChunks(manualChunks);
		const chunks: Chunk[] = [];
		const chunkByModule = new Map<Module, Chunk>();
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
