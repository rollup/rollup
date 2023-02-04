const assert = require('node:assert');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_OVERRIDE = path.join(__dirname, 'override.js');
const ID_NOOVERRIDE = path.join(__dirname, 'noOverride.js');
const ID_HIDDENNAMESPACE = path.join(__dirname, 'hiddenNamespace.js');

module.exports = {
	description: 'does not expose synthetic named exports on entry points',
	options: {
		plugins: [
			{
				transform(code, id) {
					switch (id) {
						case ID_MAIN: {
							return { syntheticNamedExports: 'synthMain' };
						}
						case ID_OVERRIDE: {
							return { syntheticNamedExports: 'synthOverride' };
						}
						case ID_NOOVERRIDE: {
							return { syntheticNamedExports: 'synthNoOverride' };
						}
						case ID_HIDDENNAMESPACE: {
							return { syntheticNamedExports: 'synthHiddenNamespace' };
						}
					}
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			explicitReexport: { override: true },
			hiddenNamespace: 'hiddenNamespace',
			main: 'main',
			noOverride: 'noOverride',
			override: 'override',
			synthHiddenNamespace: 'hidden in override',
			synthOverride: 'overridden'
		});
	}
};
