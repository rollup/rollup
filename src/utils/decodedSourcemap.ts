import { decode, encode } from '@jridgewell/sourcemap-codec';
import type {
	DecodedSourceMapOrMissing,
	ExistingDecodedSourceMap,
	ExistingRawSourceMap,
	SourceMapInput
} from '../rollup/types';

// While the types for SourceMapInput are what we expect to receive from plugins, there are cases
// in the wild where plugins return `{mappings: null}`, so we want this function to be a little more
// permissive on the input end so that we can normalize the output when creating the decoded sourcemap.
interface UnexpectedInput {
	mappings: null | undefined;
}

type Input = SourceMapInput | UnexpectedInput | ExistingDecodedSourceMap | undefined;

interface CachedSourcemapData {
	encodedMappings: string | undefined;
	decodedMappings: ExistingDecodedSourceMap['mappings'] | undefined;
}

const sourceMapCache = new WeakMap<ExistingDecodedSourceMap, CachedSourcemapData>();

/**
 * This clears the decoded array and falls back to the encoded string form.
 * Sourcemap mappings arrays can be very large and holding on to them for longer
 * than is necessary leads to poor heap utilization.
 */
function resetCacheToEncoded(cache: CachedSourcemapData) {
	if (cache.encodedMappings === undefined && cache.decodedMappings) {
		cache.encodedMappings = encode(cache.decodedMappings);
	}
	cache.decodedMappings = undefined;
}

export function resetSourcemapCache(
	map: ExistingDecodedSourceMap | null,
	sourcemapChain?: DecodedSourceMapOrMissing[]
) {
	if (map) {
		const cache = sourceMapCache.get(map);
		if (cache) {
			resetCacheToEncoded(cache);
		}
	}

	if (!sourcemapChain) {
		return;
	}

	for (const map of sourcemapChain) {
		if (map.missing) continue;

		resetSourcemapCache(map);
	}
}

export function decodedSourcemap(map: null | undefined): null;
export function decodedSourcemap(map: Exclude<Input, null | undefined>): ExistingDecodedSourceMap;
export function decodedSourcemap(map: Input): ExistingDecodedSourceMap | null;
export function decodedSourcemap(map: Input): ExistingDecodedSourceMap | null {
	if (!map) return null;

	if (typeof map === 'string') {
		map = JSON.parse(map) as ExistingRawSourceMap;
	}
	if (!map.mappings) {
		return {
			mappings: [],
			names: [],
			sources: [],
			version: 3
		};
	}

	const originalMappings = map.mappings;
	const isAlreadyDecoded = Array.isArray(originalMappings);
	const cache: CachedSourcemapData = {
		decodedMappings: isAlreadyDecoded ? originalMappings : undefined,
		encodedMappings: isAlreadyDecoded ? undefined : originalMappings
	};

	const decodedMap = {
		...(map as ExistingRawSourceMap | ExistingDecodedSourceMap),
		// By moving mappings behind an accessor, we can avoid unneeded computation for cases
		// where the mappings field is never actually accessed. This appears to greatly reduce
		// the overhead of sourcemap decoding in terms of both compute time and memory usage.
		get mappings() {
			if (cache.decodedMappings) {
				return cache.decodedMappings;
			}
			// If decodedMappings doesn't exist then encodedMappings should.
			// The only scenario where cache.encodedMappings should be undefined is if the map
			// this was constructed from was already decoded, or if mappings was set to a new
			// decoded string. In either case, this line shouldn't get hit.
			cache.decodedMappings = cache.encodedMappings ? decode(cache.encodedMappings) : [];
			cache.encodedMappings = undefined;
			return cache.decodedMappings;
		}
	};

	sourceMapCache.set(decodedMap, cache);

	return decodedMap;
}

function getEncodedMappings(map: ExistingDecodedSourceMap): string | undefined {
	const cache = sourceMapCache.get(map);
	// Reading the cache instead of the "mappings" property avoids decoding the
	// mappings, which is both expensive and would undo the lazy decoding.
	if (cache) {
		return cache.decodedMappings ? undefined : cache.encodedMappings;
	}
	// The map was not created here, e.g. because it was restored from a
	// serialized cache.
	return typeof map.mappings === 'string' ? map.mappings : undefined;
}

function areEqual(first: unknown, second: unknown): boolean {
	if (first === second) {
		return true;
	}
	if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) {
		return false;
	}
	return first.every((entry, index) => entry === second[index]);
}

/**
 * Compares the sourcemap of a cached module with a sourcemap a plugin has just
 * returned. This is deliberately conservative and only reports two sourcemaps as
 * equal if the encoded mappings of both are known. In particular, a collapsed
 * sourcemap is reported as different so that a module whose sourcemap was
 * assembled by getCombinedSourcemap is transformed again.
 */
export function isSameSourcemap(
	cachedMap: ExistingDecodedSourceMap | null | undefined,
	map: Input
): boolean {
	const otherMap = decodedSourcemap(map);
	if (!otherMap) {
		// A module cache can be provided by users and does not have to contain a
		// sourcemap.
		return !cachedMap;
	}
	if (!cachedMap) {
		return false;
	}
	const cachedMappings = getEncodedMappings(cachedMap);
	const otherMappings = getEncodedMappings(otherMap);
	return (
		cachedMappings !== undefined &&
		cachedMappings === otherMappings &&
		otherMap.sourceRoot === cachedMap.sourceRoot &&
		areEqual(otherMap.sources, cachedMap.sources) &&
		areEqual(otherMap.sourcesContent, cachedMap.sourcesContent) &&
		areEqual(otherMap.names, cachedMap.names)
	);
}
