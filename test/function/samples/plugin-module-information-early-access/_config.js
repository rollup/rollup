const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'handles accessing module information via plugins early in a graceful way',
	options: {
		external: ['path'],
		plugins: [
			{
				buildStart() {
					assert.deepStrictEqual([...this.getModuleIds()], []);
					assert.strictEqual(this.getModuleInfo(ID_MAIN), null);
				}
			}
		]
	}
});
