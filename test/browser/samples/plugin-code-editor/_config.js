const assert = require('node:assert/strict');
const { decode } = require('@jridgewell/sourcemap-codec');
const { loader } = require('../../../testHelpers.js');

const moduleCode = `const message = 'hello';
console.log(message);`;

module.exports = defineTest({
	description: 'maps unedited code when a plugin uses a code editor in the browser build',
	options: {
		plugins: [
			loader({ main: moduleCode }),
			{
				name: 'code-editor',
				transform(code) {
					const { codeEditor } = this.parse(code, { codeEditor: true });
					const literal = `'hello'`;
					const literalPosition = code.indexOf(literal);
					codeEditor.overwrite(literalPosition, literalPosition + literal.length, `'world'`);
					const map = codeEditor.generateMap();
					// The argument of the unedited call is only mapped because the
					// browser parser collected its position.
					assert.deepStrictEqual(
						decode(map.mappings)[1].find(([generatedColumn]) => generatedColumn === 12),
						[12, 0, 1, 12]
					);
					return { code: codeEditor.toString(), map };
				}
			}
		]
	}
});
