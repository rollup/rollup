import { decode } from '@jridgewell/sourcemap-codec';
import type {
	ExistingDecodedSourceMap,
	ExistingRawSourceMap,
	SourceMapInput
} from '../rollup/types';

type Input = SourceMapInput | ExistingDecodedSourceMap | undefined;

export function decodedSourcemap(map: Input): ExistingDecodedSourceMap | null {
	if (!map) return null;

	if (typeof map === 'string') {
		map = JSON.parse(map) as ExistingRawSourceMap;
	}
	if (map.mappings === '') {
		return {
			mappings: [],
			names: [],
			sources: [],
			version: 3
		};
	}

	const originalMappings = map.mappings;
	let memoizedMappings: ExistingDecodedSourceMap['mappings'] | undefined;
	return {
		...(map as ExistingRawSourceMap | ExistingDecodedSourceMap),
		// By moving mappings behind an accessor, we can avoid unneeded computation for cases
		// where the mappings field is never actually accessed. This appears to greatly reduce
		// the overhead of sourcemap decoding in terms of both compute time and memory usage.
		get mappings() {
			if (memoizedMappings) {
				return memoizedMappings;
			}
			memoizedMappings =
				typeof originalMappings === 'string' ? decode(originalMappings) : originalMappings;
			return memoizedMappings;
		},
		set mappings(value) {
			memoizedMappings = value;
		}
	};
}
