import type MagicString from 'magic-string';

export interface MagicStringWithSourcemapLocations extends MagicString {
	sourcemapLocations: { bits: Uint32Array | number[] };
}

export function addSourcemapLocation(magicString: MagicString, index: number): void {
	const bits = (magicString as MagicStringWithSourcemapLocations).sourcemapLocations.bits;
	if (!(bits instanceof Uint32Array)) {
		magicString.addSourcemapLocation(index);
	}
}
