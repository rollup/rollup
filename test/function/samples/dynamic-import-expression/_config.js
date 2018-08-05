const assert = require('assert');

module.exports = {
	description: 'Dynamic import expression replacement',
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier, parent) {
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
	runtimeError(error) {
		assert.equal("Cannot find module 'x/y'", error.message);
	}
};
