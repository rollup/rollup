const assert = require('assert');

module.exports = {
	solo: true,
	description: 'Returns the raw AST nodes for unresolvable dynamic imports',
	options: {
		plugins: [
			{
				resolveDynamicImport(specifier) {
					assert.ok(specifier);
					assert.strictEqual(typeof specifier, 'object');
					if (specifier.type !== 'TemplateLiteral' && specifier.type !== 'Literal') {
						throw new Error(`Unexpected specifier type ${specifier.type}.`);
					}
					return false;
				}
			}
		]
	}
};
