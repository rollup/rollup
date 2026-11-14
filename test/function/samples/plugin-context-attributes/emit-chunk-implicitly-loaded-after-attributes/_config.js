const assert = require('node:assert/strict');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_EMITTED_WITH_ATTRIBUTES = `${path.join(__dirname, 'emitted.js')}?attributes=${encodeURIComponent('{"type":"custom"}')}`;

module.exports = defineTest({
	description:
		'keeps the attributes of an emitted chunk that is implicitly loaded after another one',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						attributes: { type: 'custom' },
						id: './emitted.js',
						implicitlyLoadedAfterOneOf: ['./main.js'],
						type: 'chunk'
					});
				},
				buildEnd() {
					assert.deepEqual(
						this.getModuleInfo(ID_EMITTED_WITH_ATTRIBUTES)?.implicitlyLoadedAfterOneOf,
						[ID_MAIN]
					);
				}
			}
		]
	}
});
