import { DecodedSourceMapOrMissing, ExistingDecodedSourceMap } from '../rollup/types';

export function getOriginalLocation(
	sourcemapChain: DecodedSourceMapOrMissing[],
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
			// Sometimes a high-resolution sourcemap will be preceded in the sourcemap chain
			// by a low-resolution sourcemap. We can detect this by checking if the mappings
			// array for this line only contains a segment for column zero. In that case, we
			// want to fall back to a low-resolution mapping instead of throwing an error.
			const segment =
				line.length == 1 && line[0][0] == 0
					? line[0]
					: line.find(segment => segment[0] >= location.column);

			if (segment && segment.length !== 1) {
				locationFound = true;
				location = {
					column: segment[3],
					line: segment[2] + 1,
					name: segment.length === 5 ? sourcemap.names[segment[4]] : undefined,
					source: sourcemap.sources[segment[1]]
				};
			}
		}
		if (!locationFound) {
			throw new Error("Can't resolve original location of error.");
		}
	}
	return location;
}
