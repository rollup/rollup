const assert = require('node:assert');
const acorn = require('acorn');

module.exports = defineTest({
	description:
		'preserve shebang in entry module for CJS and ESM outputs, even if the ast of the entry module is returned by other plugins',
	options: {
		plugins: [
			{
				transform(code) {
					return {
						code,
						ast: acorn.parse(code, {
							ecmaVersion: 'latest',
							sourceType: 'module'
						})
					};
				},
				generateBundle(options, outputBundle) {
					const keys = Object.keys(outputBundle);
					if (options.format === 'cjs' || options.format === 'es') {
						assert.ok(outputBundle[keys[0]].code.startsWith('#!'));
					} else {
						assert.ok(!outputBundle[keys[0]].code.includes('#!'));
					}
				}
			}
		]
	}
});
