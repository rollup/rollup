const assert = require('node:assert');

module.exports = defineTest({
	description: 'Dynamic import expression replacement',
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier) {
					if (
						typeof specifier !== 'string' && // string literal concatenation
						specifier.type === 'BinaryExpression' &&
						specifier.operator === '+' &&
						specifier.left.type === 'Literal' &&
						specifier.right.type === 'Literal' &&
						typeof specifier.left.value === 'string' &&
						typeof specifier.right.value === 'string'
					) {
						return '"' + specifier.left.value + specifier.right.value + '"';
					}
				}
			}
		],
		output: { dynamicImportInCjs: false }
	},
	exports(exports) {
		const expectedError = "Cannot find module 'x/y'";
		return exports.catch(error =>
			assert.strictEqual(error.message.slice(0, expectedError.length), expectedError)
		);
	}
});
