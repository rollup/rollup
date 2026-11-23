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
		const nativeBuffer = native.parse(code, false, false, false);
		const wasmBuffer = toHostByteOrder(parse(code, false, false, false));
		assert(Buffer.from(wasmBuffer).equals(nativeBuffer));
		const nativeLocationBuffer = native.parse(code, false, false, true);
		const wasmLocationBuffer = toHostByteOrder(parse(code, false, false, true));
		assert(Buffer.from(wasmLocationBuffer).equals(nativeLocationBuffer));
		assert.strictEqual(
			toWords(nativeBuffer)[1],
			0,
			'the inventory has no sourcemap locations unless they are collected'
		);
		const locationWords = toWords(nativeLocationBuffer);
		const sourcemapLocationsPosition = locationWords[1];
		assert.notStrictEqual(
			sourcemapLocationsPosition,
			0,
			'the inventory references the collected sourcemap locations'
		);
		assert.strictEqual(
			locationWords[sourcemapLocationsPosition],
			(code.length >> 5) + 1,
			'the sourcemap locations section is sized to the code length'
		);

		// 72 is the node type id of Program, which lives in the second (high)
		// word of the walked-nodes bitset, pinning the bitset word order.
		const walkedNodesBitset = new BigUint64Array([0n, 1n << 8n]);
		const nativeWalkBuffer = await native.parseAndWalk(
			code,
			false,
			false,
			walkedNodesBitset,
			true,
			false
		);
		const wasmWalkBuffer = toHostByteOrder(
			parseAndWalkSync(code, false, false, walkedNodesBitset, true, false)
		);
		assert(Buffer.from(wasmWalkBuffer).equals(nativeWalkBuffer));
		const walkWords = toWords(nativeWalkBuffer);
		assert.strictEqual(walkWords[0], 3, 'the inventory references the root node after itself');
		assert.strictEqual(toWords(nativeBuffer)[2], 0, 'a parse buffer has no walking info');
		const walkingInfoPosition = walkWords[2];
		assert.notStrictEqual(
			walkingInfoPosition,
			0,
			'the inventory references the walking info section'
		);
		assert.strictEqual(
			walkWords[walkingInfoPosition],
			3,
			'the walking info section holds one three-word entry for the selected Program'
		);
		const nativeEmptyWalkBuffer = await native.parseAndWalk(
			code,
			false,
			false,
			new BigUint64Array([0n, 0n]),
			false,
			false
		);
		assert(
			Buffer.from(
				toHostByteOrder(
					parseAndWalkSync(code, false, false, new BigUint64Array([0n, 0n]), false, false)
				)
			).equals(nativeEmptyWalkBuffer)
		);
		const emptyWalkWords = toWords(nativeEmptyWalkBuffer);
		const emptyWalkingInfoPosition = emptyWalkWords[2];
		assert.notStrictEqual(
			emptyWalkingInfoPosition,
			0,
			'a walk request always writes the walking info section'
		);
		assert.strictEqual(
			emptyWalkWords[emptyWalkingInfoPosition],
			0,
			'the walking info section is empty when no node type is selected'
		);

		const nativeWalkLocationBuffer = await native.parseAndWalk(
			code,
			false,
			false,
			walkedNodesBitset,
			true,
			true
		);
		assert(
			Buffer.from(
				toHostByteOrder(parseAndWalkSync(code, false, false, walkedNodesBitset, true, true))
			).equals(nativeWalkLocationBuffer)
		);
		const walkLocationWords = toWords(nativeWalkLocationBuffer);
		assert.notStrictEqual(
			walkLocationWords[1],
			0,
			'a walk buffer can also have sourcemap locations'
		);
		assert.notStrictEqual(walkLocationWords[2], 0, 'a walk buffer references its walking info');
		assert.strictEqual(
			walkLocationWords[walkLocationWords[1]],
			(code.length >> 5) + 1,
			'both sections are written independently'
		);

		const errorWords = toWords(native.parse('const x = ;', false, false, false));
		assert.strictEqual(errorWords[0], 3, 'an error buffer also starts with the inventory');
		assert.strictEqual(errorWords[1], 0, 'an error buffer has no sourcemap locations');
		assert.strictEqual(errorWords[2], 0, 'an error buffer has no walking info');

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
			'value',
			'string',
			'string',
			'regexp',
			'regexp'
		]);
	});

	it('stores strings and float values in the documented word format', () => {
		const numberWords = toWords(serializeAst({ type: 'Literal', start: 0, end: 0, value: 1.5 }));
		const rootPosition = numberWords[0];
		// the raw string reference is unset here; then 1.5 is stored as the
		// low/high pair of its f64 bit pattern 0x3ff8000000000000
		assert.strictEqual(numberWords[rootPosition + 4], 0);
		assert.strictEqual(numberWords[rootPosition + 5], 0);
		assert.strictEqual(numberWords[rootPosition + 6], 0x3ff80000);
		const stringWords = toWords(
			serializeAst({ type: 'Literal', start: 0, end: 0, value: 'abcde', raw: '"abcde"' })
		);
		const stringPosition = stringWords[stringWords[0] + 4];
		assert.strictEqual(stringWords[stringPosition], 5);
		// the bytes are packed LSB-first: 'a' into the lowest byte position
		assert.strictEqual(stringWords[stringPosition + 1], 0x64636261);
		assert.strictEqual(stringWords[stringPosition + 2], 0x00000065);
	});

	it('stores the node header at the documented word offsets', () => {
		const words = toWords(
			serializeAst({
				body: [
					{
						end: 2,
						expression: { end: 1, start: 0, type: 'Literal', value: 1 },
						start: 0,
						type: 'ExpressionStatement'
					}
				],
				end: 2,
				sourceType: 'module',
				start: 0,
				type: 'Program'
			})
		);
		const nativeWords = toWords(native.parse('x;', false, false, false));
		const rootPosition = words[0];
		assert.strictEqual(rootPosition, 3, 'the root node follows the buffer inventory');
		assert.strictEqual(nativeWords[0], rootPosition, 'the native buffer has the same inventory');
		assert.strictEqual(
			words[rootPosition],
			nativeWords[rootPosition],
			'the root type is at the root position'
		);
		assert.strictEqual(words[rootPosition + 1], 0, 'the root has no parent');
		assert.strictEqual(words[rootPosition + 2], 0, 'the root start follows the parent');
		assert.strictEqual(words[rootPosition + 3], 2, 'the root end follows the start');
		assert.strictEqual(nativeWords[rootPosition + 1], 0, 'the native root has no parent');
		assert.strictEqual(
			nativeWords[rootPosition + 2],
			0,
			'the native root start follows the parent'
		);
		assert.strictEqual(nativeWords[rootPosition + 3], 2, 'the native root end follows the start');
		const nativeBodyListPosition = nativeWords[rootPosition + 4];
		const nativeStatementPosition = nativeWords[nativeBodyListPosition + 1];
		assert.strictEqual(
			nativeWords[nativeStatementPosition + 1],
			rootPosition + 1,
			'the native child stores the root position plus one'
		);
		const nativeIdentifierPosition = nativeWords[nativeStatementPosition + 4];
		const nativeNamePosition = nativeWords[nativeIdentifierPosition + 4];
		assert.strictEqual(nativeWords[nativeNamePosition], 1, 'the native name length is at word 4');
		assert.strictEqual(
			nativeWords[nativeNamePosition + 1],
			'x'.charCodeAt(0),
			'the native identifier name points at its characters'
		);
		const bodyListPosition = words[rootPosition + 4];
		const statementPosition = words[bodyListPosition + 1];
		assert.strictEqual(
			words[statementPosition + 1],
			rootPosition + 1,
			'the child stores the root position plus one'
		);
		assert.strictEqual(words[statementPosition + 2], 0, 'the child start is at word 2');
		assert.strictEqual(words[statementPosition + 3], 2, 'the child end is at word 3');
		const literalPosition = words[statementPosition + 4];
		assert.strictEqual(
			words[literalPosition + 1],
			statementPosition + 1,
			'the grandchild stores the parent node position plus one'
		);
	});

	it('stores flags and eager string fields at the documented word offsets', () => {
		const arrowWords = toWords(
			serializeAst({
				async: true,
				body: { body: [], end: 0, start: 0, type: 'BlockStatement' },
				end: 0,
				expression: false,
				generator: false,
				params: [],
				start: 0,
				type: 'ArrowFunctionExpression'
			})
		);
		const arrowRootPosition = arrowWords[0];
		assert.strictEqual(
			arrowWords[arrowRootPosition + 4],
			1,
			'the async flag is the first bit of the flags word'
		);

		const identifierWords = toWords(
			serializeAst({
				body: [
					{
						end: 1,
						expression: { end: 1, name: 'x', start: 0, type: 'Identifier' },
						start: 0,
						type: 'ExpressionStatement'
					}
				],
				end: 1,
				sourceType: 'module',
				start: 0,
				type: 'Program'
			})
		);
		const statementPosition = identifierWords[identifierWords[identifierWords[0] + 4] + 1];
		const identifierPosition = identifierWords[statementPosition + 4];
		const namePosition = identifierWords[identifierPosition + 4];
		assert.strictEqual(
			identifierWords[namePosition],
			1,
			'the Identifier name string reference is the first data word'
		);
		assert.strictEqual(identifierWords[namePosition + 1], 'x'.charCodeAt(0));
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
