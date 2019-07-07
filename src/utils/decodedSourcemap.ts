import { decode } from 'sourcemap-codec';
import { ExistingDecodedSourceMap, ExistingRawSourceMap, SourceMapInput } from '../rollup/types';

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

	let mappings;
	if (typeof map.mappings === 'string') {
		mappings = decode(map.mappings);
	} else {
		mappings = map.mappings;
	}

	return { ...(map as ExistingRawSourceMap | ExistingDecodedSourceMap), mappings };
}
