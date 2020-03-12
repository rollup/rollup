const assert = require('assert');

module.exports = {
	description: 'Dynamic import expression replacement',
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier) {
					if (typeof specifier !== 'string') {
						// string literal concatenation
						if (
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
			}
		]
	},
	exports(exports) {
		const expectedError = "Cannot find module 'x/y'";
		return exports.catch(err =>
			assert.strictEqual(err.message.slice(0, expectedError.length), expectedError)
		);
	}
};
