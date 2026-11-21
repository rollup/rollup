const assert = require('node:assert');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

// The WASM buffer is compared against the native buffer and decoded with the
// shared buffer helpers, so the full build artifacts must be present.
const native = require('../../native.js');
const { parseAndWalk, serializeAst, deserializeAst } = require('../../dist/parseAst.js');

const isBigEndianHost = new Uint8Array(new Uint32Array([1]).buffer)[0] === 0;
const toHostByteOrder = buffer => {
	// The WASM build produces little-endian buffers that the WASM wrappers flip
	// on big-endian hosts; the raw WASM exports used here need the same flip.
	if (isBigEndianHost) {
		Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength).swap32();
	}
	return buffer;
};
const toWords = buffer => new Uint32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength >> 2);

describe('ast buffer', () => {
	it('produces byte-identical buffers from the WASM and the native build', async () => {
		const {
			default: initWasm,
			parse,
			parseAndWalkSync
		} = await import('../../wasm/bindings_wasm.js');
		await initWasm({
			module_or_path: await readFile(path.join(__dirname, '../../wasm/bindings_wasm_bg.wasm'))
		});
		const code = [
			'const value = 1.5, huge = 1e308, infinite = 1e999, small = 1e-310, big = 9007199254740992;',
			'const string = "héllo, wörld", template = `${string} ✓`;',
			'const regexp = /[a-z]+/giu;',
			'export default /* @__PURE__ */ Object.freeze({ value, string, regexp });'
		].join('\n');
		const nativeBuffer = native.parse(code, false, false);
		const wasmBuffer = toHostByteOrder(parse(code, false, false));
		assert(Buffer.from(wasmBuffer).equals(nativeBuffer));

		// 72 is the node type id of Program, which lives in the second (high)
		// word of the walked-nodes bitset, pinning the bitset word order.
		const walkedNodesBitset = new BigUint64Array([0n, 1n << 8n]);
		const nativeWalkBuffer = await native.parseAndWalk(code, false, false, walkedNodesBitset, true);
		const wasmWalkBuffer = toHostByteOrder(
			parseAndWalkSync(code, false, false, walkedNodesBitset, true)
		);
		assert(Buffer.from(wasmWalkBuffer).equals(nativeWalkBuffer));
		assert.notStrictEqual(
			toWords(wasmWalkBuffer)[0],
			toWords(nativeBuffer)[0],
			'the walked buffer starts with the walking info offset instead of the node type'
		);

		const identifiers = [];
		await parseAndWalk(
			code,
			{
				Identifier: node => {
					identifiers.push(node.name);
				}
			},
			{ collectScopes: true }
		);
		assert.deepStrictEqual(identifiers, [
			'value',
			'huge',
			'infinite',
			'small',
			'big',
			'string',
			'template',
			'string',
			'regexp',
			'Object',
			'freeze',
			'value',
			'string',
			'regexp'
		]);
	});

	it('stores strings and float values in the documented word format', () => {
		const numberWords = toWords(serializeAst({ type: 'Literal', start: 0, end: 0, value: 1.5 }));
		// word 3 is the raw reference, which is unset here; then 1.5 is stored
		// as the low/high pair of its f64 bit pattern 0x3ff8000000000000
		assert.strictEqual(numberWords[3], 0x00000000);
		assert.strictEqual(numberWords[4], 0x00000000);
		assert.strictEqual(numberWords[5], 0x3ff80000);
		const stringWords = toWords(
			serializeAst({ type: 'Literal', start: 0, end: 0, value: 'abcde', raw: '"abcde"' })
		);
		const stringPosition = stringWords[3];
		assert.strictEqual(stringWords[stringPosition], 5);
		// the bytes are packed LSB-first: 'a' into the lowest byte position
		assert.strictEqual(stringWords[stringPosition + 1], 0x64636261);
		assert.strictEqual(stringWords[stringPosition + 2], 0x00000065);
	});

	it('round-trips special float and string values through serialize and decode', () => {
		const numberValues = [
			-0,
			Number.NaN,
			1e-310,
			9007199254740992,
			0.1,
			1e308,
			Number.POSITIVE_INFINITY,
			123456789.5
		];
		const stringValues = [
			'',
			'a',
			'ab',
			'abc',
			'abcd',
			'héllo, wörld',
			' ✓',
			'[a-z]+',
			'Émoji 😀 crosses 😀 word 😀 borders 😀 frequently 😀 indeed'
		];
		for (const value of numberValues) {
			const buffer = serializeAst({ type: 'Literal', start: 0, end: 0, value });
			assert(Object.is(deserializeAst(buffer).value, value), `value: ${value}`);
		}
		for (const value of stringValues) {
			const buffer = serializeAst({
				type: 'Literal',
				start: 0,
				end: 0,
				value,
				raw: JSON.stringify(value)
			});
			assert.strictEqual(deserializeAst(buffer).value, value, `value: ${value}`);
		}
	});
});
