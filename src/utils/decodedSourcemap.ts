import { decode } from 'sourcemap-codec';
import { ExistingDecodedSourceMap, ExistingRawSourceMap } from '../rollup/types';

type Input = ExistingRawSourceMap | ExistingDecodedSourceMap | string | undefined;

export function decodedSourcemap(map: Input): ExistingDecodedSourceMap | null {
	if (!map) return null;

	if (typeof map === 'string') {
		map = JSON.parse(map) as ExistingRawSourceMap;
	}

	let mappings: number[][][];
	if (typeof map.mappings === 'string') {
		mappings = decode(map.mappings);
	} else {
		mappings = map.mappings;
	}

	return { ...map, mappings };
}
