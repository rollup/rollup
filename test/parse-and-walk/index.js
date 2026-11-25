// @ts-check
/**
 * @typedef {import('../../src/rollup/types').RollupError} RollupError
 */
const path = require('node:path');
const assert = require('node:assert');
const { decode } = require('@jridgewell/sourcemap-codec');
const {
	parseAst,
	parseAstAsync,
	parseLazyAst,
	parseLazyAstAsync,
	parseAndWalk,
	serializeAst,
	deserializeAst
} = require('../../dist/parseAst');
const { assertAstEqual, expectError, runTestSuiteWithSamples } = require('../testHelpers.js');
const { readFileSync } = require('node:fs');

runTestSuiteWithSamples(
	'parse-and-walk',
	path.join(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigParseAndWalk} config
	 */
	(directory, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			path.basename(directory) + ': ' + config.description,
			async () => {
				const code = readFileSync(path.join(directory, 'main.js'), 'utf-8');

				const expectedError = config.error || config.internalError;
				if (expectedError) {
					await expectError(
						() => parseAndWalk(code, config.walk, config.parseOptions),
						expectedError
					);
					if (config.error) {
						await expectError(() => parseAst(code, config.parseOptions), config.error);
						await expectError(() => parseLazyAst(code, config.parseOptions), config.error);
						await expectError(() => parseAstAsync(code, config.parseOptions), config.error);
						await expectError(() => parseLazyAstAsync(code, config.parseOptions), config.error);
					}
				} else {
					await parseAndWalk(code, config.walk, config.parseOptions);

					if (config.assertions) {
						await config.assertions();
					}
					if (config.expectedAst) {
						assertAstEqual(parseAst(code, config.parseOptions), config.expectedAst);
						assertAstEqual(parseLazyAst(code, config.parseOptions), config.expectedAst);
						assertAstEqual(await parseAstAsync(code, config.parseOptions), config.expectedAst);
						assertAstEqual(await parseLazyAstAsync(code, config.parseOptions), config.expectedAst);
						assertAstEqual(
							deserializeAst(serializeAst(/** @type {any} */ (config.expectedAst))),
							config.expectedAst
						);
					}
				}
			}
		);
	}
);

describe('code editor', () => {
	const code = `const emoji = '🚀';\nfunction foo(bar) {\n\tif (bar) {\n\t\treturn emoji;\n\t}\n}\nfoo(emoji);\n`;

	it('maps the start and end of every node and the closing brace of block statements', () => {
		const { ast, codeEditor } = parseAst(code, { codeEditor: true });
		const mappedPositions = getMappedPositions(codeEditor.generateMap().mappings);
		const unmappedPositions = [];
		for (const position of getSourcemapPositions(ast)) {
			// Locations on a line break are not mapped by MagicString as the
			// mapping of the following line takes precedence.
			if (position >= code.length || code[position] === '\n') {
				continue;
			}
			const [line, column] = getLineAndColumn(code, position);
			if (!mappedPositions.has(`${line}:${column}`)) {
				unmappedPositions.push(position);
			}
		}
		assert.deepStrictEqual(unmappedPositions, []);
	});

	it('counts columns in UTF-16 code units after an astral character', () => {
		const { codeEditor } = parseAst(`const emoji = '🚀';\n'🚀' && emoji;\n`, {
			codeEditor: true
		});
		const mappings = decode(codeEditor.generateMap().mappings);
		// The identifier starts after the two code units of the astral character:
		// [generated column, source index, original line, original column]
		assert.deepStrictEqual(
			mappings[1].find(([generatedColumn]) => generatedColumn === 8),
			[8, 0, 1, 8]
		);
	});

	it('supports all parse helpers', async () => {
		const results = [
			parseAst(code, { codeEditor: true }),
			await parseAstAsync(code, { codeEditor: true }),
			parseLazyAst(code, { codeEditor: true }),
			await parseLazyAstAsync(code, { codeEditor: true })
		];
		const expectedPositions = getMappedPositions(results[0].codeEditor.generateMap().mappings);
		for (const { codeEditor } of results) {
			assert.strictEqual(codeEditor.original, code);
			assert.strictEqual(codeEditor.hasChanged(), false);
			assert.deepStrictEqual(
				getMappedPositions(codeEditor.generateMap().mappings),
				expectedPositions
			);
		}
	});

	it('supports the code editor together with jsx and top-level return', () => {
		const { ast, codeEditor } = parseAst('return <div>{emoji}</div>;', {
			allowReturnOutsideFunction: true,
			codeEditor: true,
			jsx: true
		});
		assert.strictEqual(ast.body[0].type, 'ReturnStatement');
		const mappedPositions = getMappedPositions(codeEditor.generateMap().mappings);
		// The identifier inside the JSX expression container
		assert.ok(mappedPositions.has('0:13'));
	});

	it('maps the code with the editor from parseAndWalk', async () => {
		const { codeEditor: parsedCodeEditor } = parseAst(code, { codeEditor: true });
		const expectedPositions = getMappedPositions(parsedCodeEditor.generateMap().mappings);
		const { codeEditor } = await parseAndWalk(code, { Identifier() {} }, { codeEditor: true });
		assert.deepStrictEqual(
			getMappedPositions(codeEditor.generateMap().mappings),
			expectedPositions
		);
	});

	it('returns the AST without a code editor unless requested', () => {
		assert.strictEqual('codeEditor' in parseAst(code), false);
		assert.strictEqual('codeEditor' in parseLazyAst(code), false);
	});

	it('applies edits and keeps mapping the unedited code', () => {
		const { codeEditor } = parseAst(code, { codeEditor: true });
		const callPosition = code.indexOf('foo(emoji)');
		codeEditor.overwrite(callPosition, callPosition + 3, 'bar');
		const map = codeEditor.generateMap({ includeContent: true });
		assert.ok(codeEditor.hasChanged());
		assert.ok(codeEditor.toString().endsWith('bar(emoji);\n'));
		assert.deepStrictEqual(map.sourcesContent, [code]);
		// The identifier inside the edited call is only mapped because the parser
		// collected its position.
		assert.ok(getMappedPositions(map.mappings).has('6:4'));
	});

	it('parses empty code with the code editor', () => {
		const { ast, codeEditor } = parseAst('', { codeEditor: true });
		assert.deepStrictEqual(ast.body, []);
		assert.strictEqual(codeEditor.original, '');
		assert.deepStrictEqual(getMappedPositions(codeEditor.generateMap().mappings), new Set());
	});

	it('maps short code without a trailing newline that ends in a node', () => {
		const shortCode = 'const a = 1;\nconsole.log(a)';
		const { ast, codeEditor } = parseAst(shortCode, { codeEditor: true });
		assert.strictEqual(ast.body[1].end, shortCode.length);
		// The call argument needs a position from the bitset word that even short
		// code has to provide.
		assert.ok(getMappedPositions(codeEditor.generateMap().mappings).has('1:12'));
	});

	it('exposes the same editor in the api and the result of parseAndWalk', async () => {
		let editorFromVisitor;
		const { codeEditor } = await parseAndWalk(
			code,
			{
				IfStatement(node, api) {
					editorFromVisitor = api.codeEditor;
					api.codeEditor.remove(node.start, node.end);
				}
			},
			{ codeEditor: true }
		);
		assert.strictEqual(editorFromVisitor, codeEditor);
		assert.strictEqual(codeEditor.toString().includes('if (bar)'), false);
	});

	it('returns the editor from parseAndWalk when no node was visited', async () => {
		const { codeEditor } = await parseAndWalk(
			code,
			{ ClassDeclaration() {} },
			{ codeEditor: true }
		);
		assert.strictEqual(codeEditor.original, code);
		assert.strictEqual(codeEditor.hasChanged(), false);
	});

	it('resolves to nothing from parseAndWalk without the option', async () => {
		assert.strictEqual(await parseAndWalk(code, { Identifier() {} }), undefined);
	});
});

/**
 * @param {string} mappings
 * @returns {Set<string>}
 */
function getMappedPositions(mappings) {
	const positions = new Set();
	for (const line of decode(mappings)) {
		for (const segment of line) {
			if (segment.length > 1) {
				positions.add(`${segment[2]}:${segment[3]}`);
			}
		}
	}
	return positions;
}

/**
 * @param {string} code
 * @param {number} position
 * @returns {[line: number, column: number]}
 */
function getLineAndColumn(code, position) {
	let line = 0;
	let lineStart = 0;
	for (let index = 0; index < position; index++) {
		if (code[index] === '\n') {
			line++;
			lineStart = index + 1;
		}
	}
	return [line, position - lineStart];
}

/**
 * @param {unknown} value
 * @param {number[]} positions
 * @returns {number[]}
 */
function getSourcemapPositions(value, positions = []) {
	if (Array.isArray(value)) {
		for (const child of value) {
			getSourcemapPositions(child, positions);
		}
	} else if (value && typeof value === 'object') {
		const node = /** @type {{end?: number, start?: number, type?: string}} */ (value);
		if (
			typeof node.type === 'string' &&
			typeof node.start === 'number' &&
			typeof node.end === 'number'
		) {
			positions.push(node.start, node.end);
			// The parser also collects the closing brace of a block statement,
			// which is one position before the end of the node.
			if (node.type === 'BlockStatement') {
				positions.push(node.end - 1);
			}
		}
		for (const child of Object.values(value)) {
			getSourcemapPositions(child, positions);
		}
	}
	return positions;
}
