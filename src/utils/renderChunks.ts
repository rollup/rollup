import { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import Chunk, { ChunkRenderResult } from '../Chunk';
import Module from '../Module';
import {
	DecodedSourceMapOrMissing,
	NormalizedOutputOptions,
	RenderedChunk,
	WarningHandler
} from '../rollup/types';
import { PluginDriver } from './PluginDriver';
import { collapseSourcemaps } from './collapseSourcemaps';
import { createHash } from './crypto';
import { decodedSourcemap } from './decodedSourcemap';
import { errFailedValidation, error } from './error';
import {
	replacePlaceholders,
	replacePlaceholdersWithDefaultAndGetContainedPlaceholders,
	replaceSinglePlaceholder
} from './hashPlaceholders';
import {
	FILE_PLACEHOLDER,
	lowercaseBundleKeys,
	OutputBundleWithPlaceholders
} from './outputBundle';
import { normalize, resolve } from './path';
import { timeEnd, timeStart } from './timers';

interface HashResult {
	containedPlaceholders: Set<string>;
	contentHash: string;
}

interface RenderedChunkWithPlaceholders {
	chunk: Chunk;
	code: string;
	fileName: string;
	map: SourceMap | null;
}

export async function renderChunks(
	chunks: Chunk[],
	bundle: OutputBundleWithPlaceholders,
	pluginDriver: PluginDriver,
	outputOptions: NormalizedOutputOptions,
	onwarn: WarningHandler
) {
	timeStart('render chunks', 2);

	reserveEntryChunksInBundle(chunks);
	const renderedChunks = await Promise.all(chunks.map(chunk => chunk.render()));

	timeEnd('render chunks', 2);
	timeStart('transform chunks', 2);

	const chunkGraph = getChunkGraph(chunks);
	const {
		nonHashedChunksWithPlaceholders,
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder
	} = await transformChunksAndGenerateContentHashes(
		renderedChunks,
		chunkGraph,
		outputOptions,
		pluginDriver,
		onwarn
	);
	const hashesByPlaceholder = generateFinalHashes(
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder,
		bundle
	);
	addChunksToBundle(
		renderedChunksByPlaceholder,
		hashesByPlaceholder,
		bundle,
		nonHashedChunksWithPlaceholders
	);

	timeEnd('transform chunks', 2);
}

function reserveEntryChunksInBundle(chunks: Chunk[]) {
	for (const chunk of chunks) {
		if (chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint) {
			// reserves name in bundle as side effect if it does not contain a hash
			chunk.getPreliminaryFileName();
		}
	}
}

function getChunkGraph(chunks: Chunk[]) {
	return Object.fromEntries(
		chunks.map(chunk => {
			const renderedChunkInfo = chunk.getRenderedChunkInfo();
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
		timeStart('sourcemaps', 3);

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

		timeEnd('sourcemaps', 3);
	}
	return {
		code,
		map
	};
}

async function transformChunksAndGenerateContentHashes(
	renderedChunks: ChunkRenderResult[],
	chunkGraph: Record<string, RenderedChunk>,
	outputOptions: NormalizedOutputOptions,
	pluginDriver: PluginDriver,
	onwarn: WarningHandler
) {
	const nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[] = [];
	const renderedChunksByPlaceholder = new Map<string, RenderedChunkWithPlaceholders>();
	const hashDependenciesByPlaceholder = new Map<string, HashResult>();
	const placeholders = new Set<string>();
	for (const {
		preliminaryFileName: { hashPlaceholder }
	} of renderedChunks) {
		if (hashPlaceholder) placeholders.add(hashPlaceholder);
	}
	await Promise.all(
		renderedChunks.map(
			async ({
				chunk,
				preliminaryFileName: { fileName, hashPlaceholder },
				magicString,
				usedModules
			}) => {
				const transformedChunk = {
					chunk,
					fileName,
					...(await transformChunk(
						magicString,
						fileName,
						usedModules,
						chunkGraph,
						outputOptions,
						pluginDriver,
						onwarn
					))
				};
				const { code } = transformedChunk;
				if (hashPlaceholder) {
					const hash = createHash();
					// To create a reproducible content-only hash, all placeholders are
					// replaced with the same value before hashing
					const { containedPlaceholders, transformedCode } =
						replacePlaceholdersWithDefaultAndGetContainedPlaceholders(code, placeholders);
					hash.update(transformedCode);
					const hashAugmentation = pluginDriver.hookReduceValueSync(
						'augmentChunkHash',
						'',
						[chunk.getRenderedChunkInfo()],
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
			}
		)
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
	bundle: OutputBundleWithPlaceholders
) {
	const hashesByPlaceholder = new Map<string, string>();
	for (const [placeholder, { fileName }] of renderedChunksByPlaceholder) {
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
		} while (bundle[lowercaseBundleKeys].has(finalFileName.toLowerCase()));
		bundle[finalFileName] = FILE_PLACEHOLDER;
		hashesByPlaceholder.set(placeholder, finalHash);
	}
	return hashesByPlaceholder;
}

function addChunksToBundle(
	renderedChunksByPlaceholder: Map<string, RenderedChunkWithPlaceholders>,
	hashesByPlaceholder: Map<string, string>,
	bundle: OutputBundleWithPlaceholders,
	nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[]
) {
	for (const { chunk, code, fileName, map } of renderedChunksByPlaceholder.values()) {
		const updatedCode = replacePlaceholders(code, hashesByPlaceholder);
		const finalFileName = replacePlaceholders(fileName, hashesByPlaceholder);
		if (map) {
			map.file = replacePlaceholders(map.file, hashesByPlaceholder);
		}
		bundle[finalFileName] = chunk.generateOutputChunk(updatedCode, map, hashesByPlaceholder);
	}
	for (const { chunk, code, fileName, map } of nonHashedChunksWithPlaceholders) {
		const updatedCode = hashesByPlaceholder.size
			? replacePlaceholders(code, hashesByPlaceholder)
			: code;
		bundle[fileName] = chunk.generateOutputChunk(updatedCode, map, hashesByPlaceholder);
	}
}
