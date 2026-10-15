import type { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import type { default as Chunk, ChunkRenderResult } from '../Chunk';
import type Module from '../Module';
import type {
	DecodedSourceMapOrMissing,
	LogHandler,
	NormalizedOutputOptions,
	RenderedChunk
} from '../rollup/types';
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
import type { PluginDriver } from './PluginDriver';
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
		hashDependenciesByPlaceholder,
		initialHashesByPlaceholder,
		nonHashedChunksWithPlaceholders,
		placeholders,
		renderedChunksByPlaceholder,
		usedFileNames
	} = await transformChunksAndGenerateContentHashes(
		renderedChunks,
		chunkGraph,
		outputOptions,
		pluginDriver,
		getHash,
		log,
		bundle
	);
	const hashesByPlaceholder = generateFinalHashes(
		renderedChunksByPlaceholder,
		hashDependenciesByPlaceholder,
		initialHashesByPlaceholder,
		placeholders,
		bundle,
		usedFileNames,
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
	log: LogHandler,
	bundle: OutputBundleWithPlaceholders
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
	const transformedChunks = await Promise.all(
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
				const hashAugmentation = hashPlaceholder
					? pluginDriver.hookReduceValueSync(
							'augmentChunkHash',
							'',
							[chunk.getRenderedChunkInfo()],
							(augmentation, pluginHash) => augmentation + (pluginHash || '')
						)
					: '';
				return {
					hashAugmentation,
					hashPlaceholder,
					preliminarySourcemapFileName,
					transformedChunk
				};
			}
		)
	);
	const usedFileNames = new Set(bundle[lowercaseBundleKeys]);
	for (const {
		transformedChunk,
		hashPlaceholder,
		preliminarySourcemapFileName,
		hashAugmentation
	} of transformedChunks) {
		const { map } = transformedChunk;
		const sourcemapHashPlaceholder = preliminarySourcemapFileName?.hashPlaceholder;
		if (map && sourcemapHashPlaceholder) {
			const { transformedCode: normalizedSourcemap } =
				replacePlaceholdersWithDefaultAndGetContainedPlaceholders(map.toString(), placeholders);
			initialHashesByPlaceholder.set(
				sourcemapHashPlaceholder,
				outputOptions.sourcemap === 'inline'
					? getHash(normalizedSourcemap).slice(0, sourcemapHashPlaceholder.length)
					: getUniqueHash(
							normalizedSourcemap,
							preliminarySourcemapFileName.fileName,
							sourcemapHashPlaceholder,
							usedFileNames,
							getHash
						)
			);
		}

		if (hashPlaceholder) {
			renderedChunksByPlaceholder.set(hashPlaceholder, transformedChunk);
			hashDependenciesByPlaceholder.set(
				hashPlaceholder,
				getChunkHash(
					transformedChunk,
					outputOptions,
					getHash,
					placeholders,
					initialHashesByPlaceholder,
					hashAugmentation
				)
			);
		} else {
			nonHashedChunksWithPlaceholders.push(transformedChunk);
		}
	}
	return {
		hashDependenciesByPlaceholder,
		initialHashesByPlaceholder,
		nonHashedChunksWithPlaceholders,
		placeholders,
		renderedChunksByPlaceholder,
		usedFileNames
	};
}

function getChunkHash(
	{ code, map, fileName, sourcemapFileName }: RenderedChunkWithPlaceholders,
	outputOptions: NormalizedOutputOptions,
	getHash: GetHash,
	placeholders: Set<string>,
	initialHashesByPlaceholder: Map<string, string>,
	hashAugmentation: string
): HashResult {
	// To create a reproducible content-only hash, all placeholders are
	// replaced with the same value before hashing
	const { containedPlaceholders, transformedCode } =
		replacePlaceholdersWithDefaultAndGetContainedPlaceholders(code, placeholders);
	let contentToHash = transformedCode;
	if (map && outputOptions.sourcemap !== 'hidden') {
		// Normalize raw map data and file names before base64 or URL encoding
		// can hide placeholders and make hashes depend on chunk order.
		let sourcemapPlaceholders: Set<string>;
		if (outputOptions.sourcemap === 'inline') {
			const { containedPlaceholders: inlinePlaceholders, transformedCode: sourcemapJson } =
				replacePlaceholdersWithDefaultAndGetContainedPlaceholders(map.toString(), placeholders);
			sourcemapPlaceholders = inlinePlaceholders;
			contentToHash += `//# ${SOURCEMAPPING_URL}=data:application/json,${sourcemapJson}\n`;
		} else {
			const { containedPlaceholders: externalPlaceholders, transformedCode: normalizedFileName } =
				replacePlaceholdersWithDefaultAndGetContainedPlaceholders(
					replacePlaceholders(sourcemapFileName ?? `${fileName}.map`, initialHashesByPlaceholder),
					placeholders
				);
			sourcemapPlaceholders = externalPlaceholders;
			contentToHash += getSourceMapComment(
				normalizedFileName,
				map,
				outputOptions.sourcemap,
				outputOptions.sourcemapBaseUrl
			);
		}
		for (const placeholder of sourcemapPlaceholders) {
			containedPlaceholders.add(placeholder);
		}
	}
	if (hashAugmentation) {
		contentToHash += hashAugmentation;
	}
	return { containedPlaceholders, contentHash: getHash(contentToHash) };
}

function getUniqueHash(
	contentToHash: string,
	fileName: string,
	placeholder: string,
	usedFileNames: Set<string>,
	getHash: GetHash
) {
	let finalFileName: string;
	let finalHash: string | undefined;
	do {
		// In case of a hash collision, create a hash of the hash
		if (finalHash) {
			contentToHash = finalHash;
		}
		finalHash = getHash(contentToHash).slice(0, placeholder.length);
		finalFileName = replaceSinglePlaceholder(fileName, placeholder, finalHash).toLowerCase();
	} while (usedFileNames.has(finalFileName));
	usedFileNames.add(finalFileName);
	return finalHash;
}

function generateFinalHashes(
	renderedChunksByPlaceholder: Map<string, RenderedChunkWithPlaceholders>,
	hashDependenciesByPlaceholder: Map<string, HashResult>,
	initialHashesByPlaceholder: Map<string, string>,
	placeholders: Set<string>,
	bundle: OutputBundleWithPlaceholders,
	usedFileNames: Set<string>,
	getHash: GetHash
) {
	const hashesByPlaceholder = new Map<string, string>(initialHashesByPlaceholder);
	for (const placeholder of placeholders) {
		const { fileName } = renderedChunksByPlaceholder.get(placeholder)!;
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
		const finalHash = getUniqueHash(contentToHash, fileName, placeholder, usedFileNames, getHash);
		bundle[replaceSinglePlaceholder(fileName, placeholder, finalHash)] = FILE_PLACEHOLDER;
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
			if (options.sourcemapDebugIds) {
				updatedCode += calculateDebugIdAndGetComment(updatedCode, map);
			}
			finalSourcemapFileName = sourcemapFileName
				? replacePlaceholders(sourcemapFileName, hashesByPlaceholder)
				: `${finalFileName}.map`;
			map.file = replacePlaceholders(map.file ?? '', hashesByPlaceholder);
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
			if (options.sourcemapDebugIds) {
				updatedCode += calculateDebugIdAndGetComment(updatedCode, map);
			}
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
	if (sourcemap !== 'inline') {
		pluginDriver.emitFile({
			fileName,
			originalFileName: null,
			source: map.toString(),
			type: 'asset'
		});
	}
	return getSourceMapComment(fileName, map, sourcemap, sourcemapBaseUrl);
}

function getSourceMapComment(
	fileName: string,
	map: SourceMap,
	sourcemap: NormalizedOutputOptions['sourcemap'],
	sourcemapBaseUrl: string | undefined
) {
	const url =
		sourcemap === 'inline'
			? map.toUrl()
			: sourcemapBaseUrl
				? new URL(basename(fileName), sourcemapBaseUrl).toString()
				: basename(fileName);
	return sourcemap === 'hidden' ? '' : `//# ${SOURCEMAPPING_URL}=${url}\n`;
}

function calculateDebugIdAndGetComment(code: string, map: SourceMap & { debugId?: string }) {
	const hash = hasherByType.hex(code);
	const debugId = [
		hash.slice(0, 8),
		hash.slice(8, 12),
		'4' + hash.slice(12, 15),
		((parseInt(hash.slice(15, 16), 16) & 3) | 8).toString(16) + hash.slice(17, 20),
		hash.slice(20, 32)
	].join('-');

	map.debugId = debugId;

	return '//# debugId=' + debugId + '\n';
}
