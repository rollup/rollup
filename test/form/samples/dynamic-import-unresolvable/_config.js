const assert = require('node:assert');

module.exports = defineTest({
	description: 'Returns the raw AST nodes for unresolvable dynamic imports',
	options: {
		plugins: [
			{
				name: 'test',
				resolveDynamicImport(specifier) {
					if (specifier === './seven.js') {
						return false;
					}
					assert.ok(specifier);
					if (typeof specifier !== 'object') {
						throw new TypeError(`Unexpected specifier type ${typeof specifier}.`);
					}
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
});
