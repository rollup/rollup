import type { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import type { default as Chunk, ChunkRenderResult } from '../Chunk';
import type Module from '../Module';
import type {
	DecodedSourceMapOrMissing,
	LogHandler,
	NormalizedOutputOptions,
	RenderedChunk
} from '../rollup/types';
import type { PluginDriver } from './PluginDriver';
import { collapseSourcemaps } from './collapseSourcemaps';
import type { GetHash } from './crypto';
import { hasherByType } from './crypto';
import { decodedSourcemap } from './decodedSourcemap';
import {
	replacePlaceholders,
	replacePlaceholdersWithDefaultAndGetContainedPlaceholders,
	replaceSinglePlaceholder
} from './hashPlaceholders';
import { error, logFailedValidation } from './logs';
import type { OutputBundleWithPlaceholders } from './outputBundle';
import { FILE_PLACEHOLDER, lowercaseBundleKeys } from './outputBundle';
import { basename, normalize, resolve } from './path';
import { SOURCEMAPPING_URL } from './sourceMappingURL';
import { timeEnd, timeStart } from './timers';

interface HashResult {
	containedPlaceholders: Set<string>;
	contentHash: string;
}

interface RenderedChunkWithPlaceholders {
	chunk: Chunk;
	code: string;
	fileName: string;
	sourcemapFileName: string | null;
	map: SourceMap | null;
}

export async function renderChunks(
	chunks: Chunk[],
	bundle: OutputBundleWithPlaceholders,
	pluginDriver: PluginDriver,
	outputOptions: NormalizedOutputOptions,
	log: LogHandler
) {
	timeStart('render chunks', 2);

	reserveEntryChunksInBundle(chunks);
	const renderedChunks = await Promise.all(chunks.map(chunk => chunk.render()));

	timeEnd('render chunks', 2);
	timeStart('transform chunks', 2);

	const getHash = hasherByType[outputOptions.hashCharacters];
	const chunkGraph = getChunkGraph(chunks);
	const {
		initialHashesByPlaceholder,
		nonHashedChunksWithPlaceholders,
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder
	} = await transformChunksAndGenerateContentHashes(
		renderedChunks,
		chunkGraph,
		outputOptions,
		pluginDriver,
		getHash,
		log
	);
	const hashesByPlaceholder = generateFinalHashes(
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder,
		initialHashesByPlaceholder,
		bundle,
		getHash
	);
	addChunksToBundle(
		renderedChunksByPlaceholder,
		hashesByPlaceholder,
		bundle,
		nonHashedChunksWithPlaceholders,
		pluginDriver,
		outputOptions
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
	log: LogHandler
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
	const {
		compact,
		dir,
		file,
		sourcemap,
		sourcemapExcludeSources,
		sourcemapFile,
		sourcemapPathTransform,
		sourcemapIgnoreList
	} = options;
	if (!compact && code[code.length - 1] !== '\n') code += '\n';

	if (sourcemap) {
		timeStart('sourcemaps', 3);

		let resultingFile: string;
		if (file) resultingFile = resolve(sourcemapFile || file);
		else if (dir) resultingFile = resolve(dir, fileName);
		else resultingFile = resolve(fileName);

		const decodedMap = magicString.generateDecodedMap({});
		map = collapseSourcemaps(
			resultingFile,
			decodedMap,
			usedModules,
			sourcemapChain,
			sourcemapExcludeSources,
			log
		);
		for (let sourcesIndex = 0; sourcesIndex < map.sources.length; ++sourcesIndex) {
			let sourcePath = map.sources[sourcesIndex];
			const sourcemapPath = `${resultingFile}.map`;
			const ignoreList = sourcemapIgnoreList(sourcePath, sourcemapPath);
			if (typeof ignoreList !== 'boolean') {
				error(logFailedValidation('sourcemapIgnoreList function must return a boolean.'));
			}
			if (ignoreList) {
				if (map.x_google_ignoreList === undefined) {
					map.x_google_ignoreList = [];
				}
				if (!map.x_google_ignoreList.includes(sourcesIndex)) {
					map.x_google_ignoreList.push(sourcesIndex);
				}
			}
			if (sourcemapPathTransform) {
				sourcePath = sourcemapPathTransform(sourcePath, sourcemapPath);
				if (typeof sourcePath !== 'string') {
					error(logFailedValidation(`sourcemapPathTransform function must return a string.`));
				}
			}
			map.sources[sourcesIndex] = normalize(sourcePath);
		}

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
	getHash: GetHash,
	log: LogHandler
) {
	const nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[] = [];
	const renderedChunksByPlaceholder = new Map<string, RenderedChunkWithPlaceholders>();
	const hashDependenciesByPlaceholder = new Map<string, HashResult>();
	const initialHashesByPlaceholder = new Map<string, string>();
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
				preliminarySourcemapFileName,
				magicString,
				usedModules
			}) => {
				const transformedChunk: RenderedChunkWithPlaceholders = {
					chunk,
					fileName,
					sourcemapFileName: preliminarySourcemapFileName?.fileName ?? null,
					...(await transformChunk(
						magicString,
						fileName,
						usedModules,
						chunkGraph,
						outputOptions,
						pluginDriver,
						log
					))
				};
				const { code, map } = transformedChunk;

				if (hashPlaceholder) {
					// To create a reproducible content-only hash, all placeholders are
					// replaced with the same value before hashing
					const { containedPlaceholders, transformedCode } =
						replacePlaceholdersWithDefaultAndGetContainedPlaceholders(code, placeholders);
					let contentToHash = transformedCode;
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
						contentToHash += hashAugmentation;
					}
					renderedChunksByPlaceholder.set(hashPlaceholder, transformedChunk);
					hashDependenciesByPlaceholder.set(hashPlaceholder, {
						containedPlaceholders,
						contentHash: getHash(contentToHash)
					});
				} else {
					nonHashedChunksWithPlaceholders.push(transformedChunk);
				}

				const sourcemapHashPlaceholder = preliminarySourcemapFileName?.hashPlaceholder;
				if (map && sourcemapHashPlaceholder) {
					initialHashesByPlaceholder.set(
						preliminarySourcemapFileName.hashPlaceholder,
						getHash(map.toString()).slice(0, preliminarySourcemapFileName.hashPlaceholder.length)
					);
				}
			}
		)
	);
	return {
		hashDependenciesByPlaceholder,
		initialHashesByPlaceholder,
		nonHashedChunksWithPlaceholders,
		renderedChunksByPlaceholder
	};
}

function generateFinalHashes(
	renderedChunksByPlaceholder: Map<string, RenderedChunkWithPlaceholders>,
	hashDependenciesByPlaceholder: Map<string, HashResult>,
	initialHashesByPlaceholder: Map<string, string>,
	bundle: OutputBundleWithPlaceholders,
	getHash: GetHash
) {
	const hashesByPlaceholder = new Map<string, string>(initialHashesByPlaceholder);
	for (const [placeholder, { fileName }] of renderedChunksByPlaceholder) {
		let contentToHash = '';
		const hashDependencyPlaceholders = new Set<string>([placeholder]);
		for (const dependencyPlaceholder of hashDependencyPlaceholders) {
			const { containedPlaceholders, contentHash } =
				hashDependenciesByPlaceholder.get(dependencyPlaceholder)!;
			contentToHash += contentHash;
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
				contentToHash = finalHash;
			}
			finalHash = getHash(contentToHash).slice(0, placeholder.length);
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
	nonHashedChunksWithPlaceholders: RenderedChunkWithPlaceholders[],
	pluginDriver: PluginDriver,
	options: NormalizedOutputOptions
) {
	for (const {
		chunk,
		code,
		fileName,
		sourcemapFileName,
		map
	} of renderedChunksByPlaceholder.values()) {
		let updatedCode = replacePlaceholders(code, hashesByPlaceholder);
		const finalFileName = replacePlaceholders(fileName, hashesByPlaceholder);
		let finalSourcemapFileName = null;
		if (map) {
			finalSourcemapFileName = sourcemapFileName
				? replacePlaceholders(sourcemapFileName, hashesByPlaceholder)
				: `${finalFileName}.map`;
			map.file = replacePlaceholders(map.file, hashesByPlaceholder);
			updatedCode += emitSourceMapAndGetComment(finalSourcemapFileName, map, pluginDriver, options);
		}
		bundle[finalFileName] = chunk.finalizeChunk(
			updatedCode,
			map,
			finalSourcemapFileName,
			hashesByPlaceholder
		);
	}
	for (const { chunk, code, fileName, sourcemapFileName, map } of nonHashedChunksWithPlaceholders) {
		let updatedCode =
			hashesByPlaceholder.size > 0 ? replacePlaceholders(code, hashesByPlaceholder) : code;
		let finalSourcemapFileName = null;
		if (map) {
			finalSourcemapFileName = sourcemapFileName
				? replacePlaceholders(sourcemapFileName, hashesByPlaceholder)
				: `${fileName}.map`;
			updatedCode += emitSourceMapAndGetComment(finalSourcemapFileName, map, pluginDriver, options);
		}
		bundle[fileName] = chunk.finalizeChunk(
			updatedCode,
			map,
			finalSourcemapFileName,
			hashesByPlaceholder
		);
	}
}

function emitSourceMapAndGetComment(
	fileName: string,
	map: SourceMap,
	pluginDriver: PluginDriver,
	{ sourcemap, sourcemapBaseUrl }: NormalizedOutputOptions
) {
	let url: string;
	if (sourcemap === 'inline') {
		url = map.toUrl();
	} else {
		const sourcemapFileName = basename(fileName);
		url = sourcemapBaseUrl
			? new URL(sourcemapFileName, sourcemapBaseUrl).toString()
			: sourcemapFileName;
		pluginDriver.emitFile({
			fileName,
			originalFileName: null,
			source: map.toString(),
			type: 'asset'
		});
	}
	return sourcemap === 'hidden' ? '' : `//# ${SOURCEMAPPING_URL}=${url}\n`;
}
