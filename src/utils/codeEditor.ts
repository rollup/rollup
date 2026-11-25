import MagicString from 'magic-string';
import type { CodeEditor } from '../rollup/types';
import { getSourcemapLocations } from './bufferInventory';
import type { AstBuffer } from './getAstBuffer';

interface MagicStringWithSourcemapLocations extends MagicString {
	sourcemapLocations: { bits: Uint32Array };
}

// The locations are a hidden field of MagicString that is only read when
// generating a map without "hires". The copy decouples the editor from the
// parsed AST buffer and fixes the length to the code, as MagicString only grows
// its default array but silently drops writes past the end of a typed array.
export function primeSourcemapLocations(
	magicString: MagicString,
	code: string,
	sourcemapLocations: Uint32Array | null
): void {
	if (!sourcemapLocations) {
		return;
	}
	const fittedSourcemapLocations = new Uint32Array((code.length >> 5) + 1);
	fittedSourcemapLocations.set(sourcemapLocations.subarray(0, fittedSourcemapLocations.length));
	(magicString as MagicStringWithSourcemapLocations).sourcemapLocations.bits =
		fittedSourcemapLocations;
}

export const createCodeEditor = (code: string, astBuffer: AstBuffer): CodeEditor => {
	const codeEditor = new MagicString(code);
	primeSourcemapLocations(codeEditor, code, getSourcemapLocations(astBuffer));
	return codeEditor;
};
