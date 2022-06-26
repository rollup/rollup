import { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import Chunk, { ChunkRenderResult, RenderedChunkWithPlaceholders } from '../Chunk';
import Module from '../Module';
import {
	DecodedSourceMapOrMissing,
	NormalizedOutputOptions,
	OutputBundleWithPlaceholders,
	RenderedChunk,
	WarningHandler
} from '../rollup/types';
import { FILE_PLACEHOLDER } from './FileEmitter';
import { PluginDriver } from './PluginDriver';
import { collapseSourcemaps } from './collapseSourcemaps';
import { createHash } from './crypto';
import { decodedSourcemap } from './decodedSourcemap';
import { errFailedValidation, error } from './error';
import { GenerateCodeSnippets } from './generateCodeSnippets';
import {
	replacePlaceholders,
	replacePlaceholdersWithDefaultAndGetContainedPlaceholders,
	replaceSinglePlaceholder
} from './hashPlaceholders';
import { normalize, resolve } from './path';
import { timeEnd, timeStart } from './timers';

interface HashResult {
	containedPlaceholders: Set<string>;
	contentHash: string;
}

export async function renderChunks(
	chunks: Chunk[],
	chunksByPlaceholder: Map<string, Chunk>,
	outputBundle: OutputBundleWithPlaceholders,
	inputBase: string,
	snippets: GenerateCodeSnippets,
	pluginDriver: PluginDriver,
	outputOptions: NormalizedOutputOptions,
	onwarn: WarningHandler
) {
	reserveEntryChunksInBundle(chunks, inputBase);
	// populates chunksByPlaceholder as side effect
	const renderedChunks = await Promise.all(chunks.map(chunk => chunk.render(inputBase, snippets)));
	const chunkGraph: Record<string, RenderedChunk> = getChunkGraph(chunks, inputBase, snippets);
	const {
		nonHashedChunksWithPlaceholders,
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder
	} = await transformChunksAndGenerateContentHashes(
		renderedChunks,
		inputBase,
		chunkGraph,
		outputOptions,
		pluginDriver,
		onwarn,
		chunksByPlaceholder,
		snippets
	);
	const hashesByPlaceholder = generateFinalHashes(
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder,
		outputBundle
	);
	addChunksToBundle(
		renderedChunksByPlaceholder,
		hashesByPlaceholder,
		outputBundle,
		inputBase,
		snippets,
		nonHashedChunksWithPlaceholders
	);
}

function reserveEntryChunksInBundle(chunks: Chunk[], inputBase: string) {
	for (const chunk of chunks) {
		if (chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint) {
			// reserves name in bundle as side effect if it does not contain a hash
			chunk.getPreliminaryFileName(inputBase);
		}
	}
}

function getChunkGraph(chunks: Chunk[], inputBase: string, snippets: GenerateCodeSnippets) {
	return Object.fromEntries(
		chunks.map(chunk => {
			const renderedChunkInfo = chunk.getRenderedChunkInfo(inputBase, snippets.getPropertyAccess);
			return [renderedChunkInfo.fileName, renderedChunkInfo];
		})
	);
}

async function transformChunk(
	magicString: MagicStringBundle,
	fileName: string,
	usedModules: Module[],
	chunkGraph: Record<string, RenderedChunk>,
	options: NormalizedOutputOptions,
	outputPluginDriver: PluginDriver,
	onwarn: WarningHandler
) {
	let map: SourceMap | null = null;
	const sourcemapChain: DecodedSourceMapOrMissing[] = [];
	let code = await outputPluginDriver.hookReduceArg0(
		'renderChunk',
		[magicString.toString(), chunkGraph[fileName], options, { chunks: chunkGraph }],
		(code, result, plugin) => {
			if (result == null) return code;

			if (typeof result === 'string')
				result = {
					code: result,
					map: undefined
				};

			// strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
			if (result.map !== null) {
				const map = decodedSourcemap(result.map);
				sourcemapChain.push(map || { missing: true, plugin: plugin.name });
			}

			return result.code;
		}
	);
	const { compact, sourcemap, sourcemapPathTransform } = options;
	if (!compact && code[code.length - 1] !== '\n') code += '\n';

	if (sourcemap) {
		timeStart('sourcemap', 2);

		let file: string;
		if (options.file) file = resolve(options.sourcemapFile || options.file);
		else if (options.dir) file = resolve(options.dir, fileName);
		else file = resolve(fileName);

		const decodedMap = magicString.generateDecodedMap({});
		map = collapseSourcemaps(
			file,
			decodedMap,
			usedModules,
			sourcemapChain,
			options.sourcemapExcludeSources,
			onwarn
		);
		map.sources = map.sources
			.map(sourcePath => {
				if (sourcemapPathTransform) {
					const newSourcePath = sourcemapPathTransform(sourcePath, `${file}.map`) as unknown;

					if (typeof newSourcePath !== 'string') {
						error(errFailedValidation(`sourcemapPathTransform function must return a string.`));
					}

					return newSourcePath;
				}

				return sourcePath;
			})
			.map(normalize);

		timeEnd('sourcemap', 2);
	}
	return {
		code,
		map
	};
}

async function transformChunksAndGenerateContentHashes(
	renderedChunks: ChunkRenderResult[],
	inputBase: string,
	chunkGraph: Record<string, RenderedChunk>,
	outputOptions: NormalizedOutputOptions,
	pluginDriver: PluginDriver,
	onwarn: WarningHandler,
	chunksByPlaceholder: Map<string, Chunk>,
	snippets: GenerateCodeSnippets
) {
	const nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[] = [];
	const renderedChunksByPlaceholder = new Map<string, RenderedChunkWithPlaceholders>();
	const hashDependenciesByPlaceholder = new Map<string, HashResult>();
	await Promise.all(
		renderedChunks.map(async ({ chunk, magicString, usedModules }) => {
			const preliminaryFileName = chunk.getPreliminaryFileName(inputBase);
			const transformedChunk = {
				chunk,
				preliminaryFileName,
				...(await transformChunk(
					magicString,
					preliminaryFileName.fileName,
					usedModules,
					chunkGraph,
					outputOptions,
					pluginDriver,
					onwarn
				))
			};
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
				const hashAugmentation = pluginDriver.hookReduceValueSync(
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
	return {
		hashDependenciesByPlaceholder,
		nonHashedChunksWithPlaceholders,
		renderedChunksByPlaceholder
	};
}

function generateFinalHashes(
	renderedChunksByPlaceholder: Map<string, RenderedChunkWithPlaceholders>,
	hashDependenciesByPlaceholder: Map<string, HashResult>,
	outputBundle: OutputBundleWithPlaceholders
) {
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
	return hashesByPlaceholder;
}

function addChunksToBundle(
	renderedChunksByPlaceholder: Map<string, RenderedChunkWithPlaceholders>,
	hashesByPlaceholder: Map<string, string>,
	outputBundle: OutputBundleWithPlaceholders,
	inputBase: string,
	snippets: GenerateCodeSnippets,
	nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[]
) {
	for (const { chunk, code, map, preliminaryFileName } of renderedChunksByPlaceholder.values()) {
		const updatedCode = replacePlaceholders(code, hashesByPlaceholder);
		const fileName = replacePlaceholders(preliminaryFileName.fileName, hashesByPlaceholder);
		if (map) {
			map.file = replacePlaceholders(map.file, hashesByPlaceholder);
		}
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
}
