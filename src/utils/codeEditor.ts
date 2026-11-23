import MagicString from 'magic-string';
import type { CodeEditor } from '../rollup/types';
import { getSourcemapLocations } from './bufferInventory';
import type { AstBuffer } from './getAstBuffer';

interface MagicStringWithSourcemapLocations extends MagicString {
	sourcemapLocations: { bits: Uint32Array };
}

// The locations are a hidden field of MagicString that is only read when
// generating a map without "hires". They are copied so that the editor neither
// keeps the parsed AST buffer alive nor misses positions beyond its section.
export function primeSourcemapLocations(
	magicString: MagicString,
	code: string,
	sourcemapLocations: Uint32Array | null
): void {
	const fittedSourcemapLocations = new Uint32Array((code.length >> 5) + 1);
	if (sourcemapLocations) {
		fittedSourcemapLocations.set(sourcemapLocations.subarray(0, fittedSourcemapLocations.length));
	}
	(magicString as MagicStringWithSourcemapLocations).sourcemapLocations.bits =
		fittedSourcemapLocations;
}

export const createCodeEditor = (code: string, astBuffer: AstBuffer): CodeEditor => {
	const codeEditor = new MagicString(code);
	primeSourcemapLocations(codeEditor, code, getSourcemapLocations(astBuffer));
	return codeEditor;
};
