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

// Word offsets of the fields of the buffer inventory that starts every buffer.
const FORMAT_VERSION_WORD = 0;
const AST_WORD = 1;
const SOURCEMAP_LOCATIONS_WORD = 2;
const WALKING_INFO_WORD = 3;
const INVENTORY_WORD_COUNT = 4;

describe('ast buffer', () => {
	// Node type codes are positional in scripts/ast-types.ts, where Program is
	// 72, which lives in the high word of the walked-nodes bitset.
	const WALKED_NODES_BITSET = new BigUint64Array([0n, 1n << 8n]);
	// mirrors WALKING_ENTRY_WORDS in rust/parse_ast/src/convert_ast/converter.rs
	const WALKING_ENTRY_WORDS = 3;
	const parsedCode = [
		'const value = 1.5, huge = 1e308, infinite = 1e999, small = 1e-310, big = 9007199254740992;',
		'const string = "héllo, wörld", template = `${string} ✓`;',
		'const regexp = /[a-z]+/giu;',
		'export default /* @__PURE__ */ Object.freeze({ value, string, regexp });'
	].join('\n');

	let wasm;

	before(async () => {
		wasm = await import('../../wasm/bindings_wasm.js');
		await wasm.default({
			module_or_path: await readFile(path.join(__dirname, '../../wasm/bindings_wasm_bg.wasm'))
		});
	});

	it('produces byte-identical buffers from the WASM and the native build', async () => {
		const { parse, parseAndWalkSync } = wasm;
		const assertBuffersMatch = (wasmBuffer, nativeBuffer, description) => {
			assert(
				Buffer.from(toHostByteOrder(wasmBuffer)).equals(nativeBuffer),
				`the WASM build produces the same buffer as the native build for ${description}`
			);
		};
		assertBuffersMatch(
			parse(parsedCode, false, false, false),
			native.parse(parsedCode, false, false, false),
			'a parse without sourcemap locations'
		);
		assertBuffersMatch(
			parse(parsedCode, false, false, true),
			native.parse(parsedCode, false, false, true),
			'a parse with sourcemap locations'
		);
		assertBuffersMatch(
			parse('const x = ;', false, false, false),
			native.parse('const x = ;', false, false, false),
			'a parse error'
		);
		assertBuffersMatch(
			parseAndWalkSync(parsedCode, false, false, WALKED_NODES_BITSET, true, false),
			await native.parseAndWalk(parsedCode, false, false, WALKED_NODES_BITSET, true, false),
			'a walk'
		);
		assertBuffersMatch(
			parseAndWalkSync(parsedCode, false, false, new BigUint64Array([0n, 0n]), false, false),
			await native.parseAndWalk(
				parsedCode,
				false,
				false,
				new BigUint64Array([0n, 0n]),
				false,
				false
			),
			'a walk without selected nodes'
		);
		assertBuffersMatch(
			parseAndWalkSync(parsedCode, false, false, WALKED_NODES_BITSET, true, true),
			await native.parseAndWalk(parsedCode, false, false, WALKED_NODES_BITSET, true, true),
			'a walk with sourcemap locations'
		);
	});

	it('writes the buffer inventory and its sections', async () => {
		const plainWords = toWords(native.parse(parsedCode, false, false, false));
		assert.strictEqual(
			plainWords[AST_WORD],
			INVENTORY_WORD_COUNT,
			'the root node follows the buffer inventory'
		);
		assert.strictEqual(
			plainWords[SOURCEMAP_LOCATIONS_WORD],
			0,
			'sourcemap locations are only referenced when they are collected'
		);
		assert.strictEqual(plainWords[WALKING_INFO_WORD], 0, 'a parse buffer has no walking info');

		const locationWords = toWords(native.parse(parsedCode, false, false, true));
		const sourcemapLocationsPosition = locationWords[SOURCEMAP_LOCATIONS_WORD];
		assert.notStrictEqual(
			sourcemapLocationsPosition,
			0,
			'the inventory references the collected sourcemap locations'
		);
		assert.strictEqual(
			locationWords[AST_WORD],
			INVENTORY_WORD_COUNT,
			'sourcemap locations do not move the root node'
		);
		assert.strictEqual(
			locationWords[sourcemapLocationsPosition],
			(parsedCode.length >> 5) + 1,
			'the sourcemap locations section reaches the word of the last code position'
		);

		const walkWords = toWords(
			await native.parseAndWalk(parsedCode, false, false, WALKED_NODES_BITSET, true, false)
		);
		assert.strictEqual(
			walkWords[AST_WORD],
			INVENTORY_WORD_COUNT,
			'walking info does not move the root node'
		);
		assert.strictEqual(
			walkWords[SOURCEMAP_LOCATIONS_WORD],
			0,
			'a walk without collected locations has no sourcemap section'
		);
		const walkingInfoPosition = walkWords[WALKING_INFO_WORD];
		assert.notStrictEqual(
			walkingInfoPosition,
			0,
			'the inventory references the walking info section'
		);
		assert.strictEqual(
			walkWords[walkingInfoPosition],
			WALKING_ENTRY_WORDS,
			'the selected Program gets one entry'
		);

		const emptyWalkWords = toWords(
			await native.parseAndWalk(
				parsedCode,
				false,
				false,
				new BigUint64Array([0n, 0n]),
				false,
				false
			)
		);
		const emptyWalkingInfoPosition = emptyWalkWords[WALKING_INFO_WORD];
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

		const walkLocationWords = toWords(
			await native.parseAndWalk(parsedCode, false, false, WALKED_NODES_BITSET, true, true)
		);
		assert.strictEqual(
			walkLocationWords[AST_WORD],
			INVENTORY_WORD_COUNT,
			'two sections do not move the root node'
		);
		const walkLocationSection = walkLocationWords[SOURCEMAP_LOCATIONS_WORD];
		const walkInfoSection = walkLocationWords[WALKING_INFO_WORD];
		assert.notStrictEqual(
			walkLocationSection,
			0,
			'a walk buffer can also have sourcemap locations'
		);
		assert.notStrictEqual(walkInfoSection, 0, 'a walk buffer references its walking info');
		assert.ok(walkLocationSection < walkInfoSection, 'sections are appended in inventory order');
		assert.strictEqual(
			walkLocationWords[walkLocationSection],
			(parsedCode.length >> 5) + 1,
			'the sourcemap locations section keeps the word of the last code position'
		);
		assert.strictEqual(
			walkLocationWords[walkInfoSection],
			WALKING_ENTRY_WORDS,
			'the walking info section keeps its entry'
		);

		const errorWords = toWords(native.parse('const x = ;', false, false, false));
		assert.strictEqual(
			errorWords[AST_WORD],
			INVENTORY_WORD_COUNT,
			'an error buffer also starts with the inventory'
		);
		assert.strictEqual(
			errorWords[SOURCEMAP_LOCATIONS_WORD],
			0,
			'an error buffer has no sourcemap locations'
		);
		assert.strictEqual(errorWords[WALKING_INFO_WORD], 0, 'an error buffer has no walking info');
	});

	it('passes matching identifiers to walk visitors', async () => {
		const identifiers = [];
		await parseAndWalk(
			parsedCode,
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
		const rootPosition = numberWords[AST_WORD];
		// the raw string reference is unset here; then 1.5 is stored as the
		// low/high pair of its f64 bit pattern 0x3ff8000000000000
		assert.strictEqual(numberWords[rootPosition + 4], 0);
		assert.strictEqual(numberWords[rootPosition + 5], 0);
		assert.strictEqual(numberWords[rootPosition + 6], 0x3ff80000);
		const stringWords = toWords(
			serializeAst({ type: 'Literal', start: 0, end: 0, value: 'abcde', raw: '"abcde"' })
		);
		const stringPosition = stringWords[stringWords[AST_WORD] + 4];
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
		const rootPosition = words[AST_WORD];
		assert.strictEqual(
			rootPosition,
			INVENTORY_WORD_COUNT,
			'the root node follows the buffer inventory'
		);
		assert.strictEqual(
			nativeWords[AST_WORD],
			rootPosition,
			'the native buffer has the same inventory'
		);
		assert.strictEqual(
			words[FORMAT_VERSION_WORD],
			nativeWords[FORMAT_VERSION_WORD],
			'serializeAst writes the same buffer format version as the parser'
		);
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
		const arrowRootPosition = arrowWords[AST_WORD];
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
		const statementPosition = identifierWords[identifierWords[identifierWords[AST_WORD] + 4] + 1];
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
