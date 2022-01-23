const assert = require('assert');
const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	skip: true,
	description: 'does not expose synthetic named exports on entry points',
	options: {
		plugins: [
			{
				transform(code, id) {
					// TODO Lukas assign correct synthetic namespaces
					// switch (id) {
					// 	case ID_MAIN:
					// 		return { syntheticNamedExports: 'synthMain' };
					// }
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			explicitReexport: { override: true },
			main: 'main',
			noOverride: 'noOverride',
			override: 'override',
			synthOverride: 'overridden'
		});
	}
};
