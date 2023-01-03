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

	const mappings = typeof map.mappings === 'string' ? decode(map.mappings) : map.mappings;

	return { ...(map as ExistingRawSourceMap | ExistingDecodedSourceMap), mappings };
}
