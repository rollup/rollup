const assert = require('node:assert/strict');
const { decode } = require('@jridgewell/sourcemap-codec');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'keeps the sourcemap locations of unedited code from a plugin code editor',
	formats: ['es'],
	options: {
		plugins: [
			{
				name: 'code-editor',
				transform(code) {
					const { ast, codeEditor } = this.parse(code, { codeEditor: true });
					const declaration = ast.body[0].declaration;
					codeEditor.overwrite(declaration.id.start, declaration.id.end, 'getRenamedValue');
					return { code: codeEditor.toString(), map: codeEditor.generateMap() };
				}
			}
		]
	},
	async test(code, map) {
		assert.ok(code.includes('function getRenamedValue()'));
		const mappedOriginalPositions = new Set();
		for (const line of decode(map.mappings)) {
			for (const segment of line) {
				if (segment.length > 1) {
					mappedOriginalPositions.add(`${segment[2]}:${segment[3]}`);
				}
			}
		}
		// The return statement is only mapped because the parser collected its position
		assert.ok(mappedOriginalPositions.has('2:1'));

		// The identifier inside the unedited return statement is mapped only
		// because the parser locations are installed into MagicString's bitset;
		// without them the position would resolve to the start of the line.
		const consumer = await new SourceMapConsumer(map);
		const originalPosition = consumer.originalPositionFor(
			getLocation(code, code.lastIndexOf('rocket'))
		);
		assert.strictEqual(originalPosition.line, 3);
		assert.strictEqual(originalPosition.column, 8);
	}
});
