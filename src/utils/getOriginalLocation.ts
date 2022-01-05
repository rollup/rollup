import { DecodedSourceMapOrMissing, ExistingDecodedSourceMap } from '../rollup/types';

export function getOriginalLocation(
	sourcemapChain: readonly DecodedSourceMapOrMissing[],
	location: { column: number; line: number; name?: string; source?: string }
): { column: number; line: number } {
	const filteredSourcemapChain = sourcemapChain.filter(
		(sourcemap): sourcemap is ExistingDecodedSourceMap => !!sourcemap.mappings
	);

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
