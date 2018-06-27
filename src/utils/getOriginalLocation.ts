import { ExistingRawSourceMap, RawSourceMap } from '../rollup/types';

export function getOriginalLocation(
	sourcemapChain: RawSourceMap[],
	location: { line: number; column: number; source?: string; name?: string }
) {
	const filteredSourcemapChain = sourcemapChain.filter(sourcemap => sourcemap.mappings);

	while (filteredSourcemapChain.length > 0) {
		const sourcemap = <ExistingRawSourceMap>filteredSourcemapChain.pop();
		const line: any = sourcemap.mappings[location.line - 1];
		let locationFound = false;

		if (line !== undefined) {
			for (const segment of line) {
				if (segment[0] >= location.column) {
					if (segment.length < 4) break;
					location = {
						line: segment[2] + 1,
						column: segment[3],
						source: sourcemap.sources[segment[1]],
						name: sourcemap.names[segment[4]]
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
