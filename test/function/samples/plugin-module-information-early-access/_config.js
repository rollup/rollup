const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'handles accessing module information via plugins early in a graceful way',
	options: {
		external: ['path'],
		plugins: [
			{
				buildStart() {
					assert.deepStrictEqual(Array.from(this.getModuleIds()), []);
					// should throw "not found" error
					this.getModuleInfo(ID_MAIN);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: `Unable to find module ${ID_MAIN}`,
		plugin: 'at position 1'
	}
};
