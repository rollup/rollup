const assert = require('node:assert');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

describe('ast buffer', () => {
	it('keeps strings and number values while swapping all other fields when byte order swapping is requested', async () => {
		const { default: initWasm, parse } = await import('../../wasm/bindings_wasm.js');
		await initWasm({
			module_or_path: await readFile(path.join(__dirname, '../../wasm/bindings_wasm_bg.wasm'))
		});
		const code = [
			'const number = -1.5, big = 2 ** 53, small = 1e-310, bigint = 123n;',
			'const string = "héllo, wörld", template = `${string} ✓`;',
			'const regexp = /[a-z]+/giu;',
			'export default /* @__PURE__ */ Object.freeze({ number, string, regexp });'
		].join('\n');
		const nativeBuffer = Buffer.from(parse(code, false, false, false));
		const swappedBuffer = Buffer.from(parse(code, false, false, true));

		assert.strictEqual(swappedBuffer.length, nativeBuffer.length);
		for (let position = 0; position < nativeBuffer.length; position += 4) {
			const nativeWord = nativeBuffer.subarray(position, position + 4);
			const swappedWord = swappedBuffer.subarray(position, position + 4);
			const isSwapped = swappedWord.every((byte, index) => byte === nativeWord[3 - index]);
			const isKept = swappedWord.every((byte, index) => byte === nativeWord[index]);
			assert(isSwapped || isKept, `the word at position ${position} is neither swapped nor kept`);
		}
		// the type of the root node is the first 32-bit field
		assertIsSwappedWord(swappedBuffer, nativeBuffer, 0);
		for (const string of ['héllo, wörld', ' ✓', '[a-z]+']) {
			const stringBytes = Buffer.from(string, 'utf8');
			const position = nativeBuffer.indexOf(stringBytes);
			assert.notStrictEqual(position, -1, `"${string}" not found in the buffer`);
			assert(
				swappedBuffer.subarray(position, position + stringBytes.length).equals(stringBytes),
				`the string "${string}" is not kept`
			);
			assertIsSwappedWord(swappedBuffer, nativeBuffer, position - 4);
		}
		for (const value of [1.5, 53, 1e-310]) {
			const valueBytes = Buffer.alloc(8);
			valueBytes.writeDoubleLE(value, 0);
			const position = nativeBuffer.indexOf(valueBytes);
			assert.notStrictEqual(position, -1, `the number ${value} not found in the buffer`);
			assert(
				swappedBuffer.subarray(position, position + 8).equals(valueBytes),
				`the number ${value} is not kept`
			);
		}
	});
});

function assertIsSwappedWord(swappedBuffer, nativeBuffer, position) {
	for (let offset = 0; offset < 4; offset++) {
		assert.strictEqual(
			swappedBuffer[position + offset],
			nativeBuffer[position + (3 - offset)],
			`the word at position ${position} is not swapped`
		);
	}
}
