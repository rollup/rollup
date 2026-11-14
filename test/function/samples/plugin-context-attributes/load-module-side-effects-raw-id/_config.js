const assert = require('node:assert/strict');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DATA = path.join(__dirname, 'data.js');
const sideEffectsIds = [];

module.exports = defineTest({
	description: 'passes the raw id to treeshake.moduleSideEffects when loading via this.load',
	options: {
		treeshake: {
			moduleSideEffects(id) {
				sideEffectsIds.push(id);
				return true;
			}
		},
		plugins: [
			{
				name: 'test',
				async buildStart() {
					await this.load({ id: { attributes: { type: 'custom' }, rawId: ID_DATA } });
				},
				buildEnd() {
					assert.deepEqual(sideEffectsIds.sort(), [ID_DATA, ID_MAIN]);
				}
			}
		]
	}
});
