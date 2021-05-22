import { DecodedSourceMapOrMissing, ExistingDecodedSourceMap } from '../rollup/types';

export function getOriginalLocation(
	sourcemapChain: DecodedSourceMapOrMissing[],
	location: { column: number; line: number; name?: string; source?: string }
): { column: number; line: number } {
	// This cast is guaranteed. If it were a missing Map, it wouldn't have a mappings.
	const filteredSourcemapChain = sourcemapChain.filter(
		sourcemap => sourcemap.mappings
	) as ExistingDecodedSourceMap[];

	while (filteredSourcemapChain.length > 0) {
		const sourcemap = filteredSourcemapChain.pop()!;
		const line = sourcemap.mappings[location.line - 1];
		let locationFound = false;

		if (line !== undefined) {
			for (const segment of line) {
				if (segment[0] >= location.column) {
					if (segment.length === 1) break;
					location = {
						column: segment[3],
						line: segment[2] + 1,
						name: segment.length === 5 ? sourcemap.names[segment[4]] : undefined,
						source: sourcemap.sources[segment[1]]
					};
					locationFound = true;
					break;
				}
			}
		}
		if (!locationFound) {
			throw new Error("Can't resolve original location of error.");
		}
	}
	return location;
}
