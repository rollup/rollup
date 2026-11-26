import MagicString from 'magic-string';
import type { CodeEditor } from '../rollup/types';
import { corruptedBufferError, getSourcemapLocations } from './bufferInventory';
import type { AstBuffer } from './getAstBuffer';

interface MagicStringWithSourcemapLocations extends MagicString {
	sourcemapLocations: { bits: Uint32Array };
}

// The locations are a hidden field of MagicString that is only read when
// generating a map without "hires". A module keeps its parsed buffer alive, so
// the section can be installed without copying it.
export function primeSourcemapLocations(
	magicString: MagicString,
	sourcemapLocations: Uint32Array | null
): void {
	if (!sourcemapLocations) {
		throw corruptedBufferError('the sourcemap locations section is missing');
	}
	(magicString as MagicStringWithSourcemapLocations).sourcemapLocations.bits = sourcemapLocations;
}

export const createCodeEditor = (code: string, astBuffer: AstBuffer): CodeEditor => {
	const codeEditor = new MagicString(code);
	const sourcemapLocations = getSourcemapLocations(astBuffer);
	// A code editor may outlive the parsed buffer, so it keeps only the section.
	primeSourcemapLocations(codeEditor, sourcemapLocations?.slice() ?? null);
	return codeEditor;
};
