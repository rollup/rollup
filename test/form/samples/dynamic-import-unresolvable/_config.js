const assert = require('assert');

module.exports = {
	description: 'Returns the raw AST nodes for unresolvable dynamic imports',
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier) {
					if (specifier === './seven.js') {
						return false;
					}
					assert.ok(specifier);
					assert.strictEqual(typeof specifier, 'object');
					if (specifier.type === 'Literal') {
						return "'./seven.js'";
					}
					if (specifier.type !== 'TemplateLiteral') {
						throw new Error(`Unexpected specifier type ${specifier.type}.`);
					}
					return false;
				}
			}
		]
	}
};
