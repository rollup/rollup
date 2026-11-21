const assert = require('node:assert/strict');
const path = require('node:path');

const ENCODED_ATTRIBUTES = encodeURIComponent('{"type":"custom"}');
const ID_FIRST_WITH_ATTRIBUTES = `${path.join(__dirname, 'first.js')}?attributes=${ENCODED_ATTRIBUTES}`;
const ID_SECOND_WITH_ATTRIBUTES = `${path.join(__dirname, 'second.js')}?attributes=${ENCODED_ATTRIBUTES}`;

module.exports = defineTest({
	description:
		'resolves implicit dependants given as objects or composite ids via their raw ids and attributes',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						id: './emitted.js',
						implicitlyLoadedAfterOneOf: [
							{ attributes: { type: 'custom' }, rawId: './first.js' },
							ID_SECOND_WITH_ATTRIBUTES
						],
						type: 'chunk'
					});
				},
				buildEnd() {
					assert.deepEqual(
						this.getModuleInfo(path.join(__dirname, 'emitted.js')).implicitlyLoadedAfterOneOf,
						[ID_FIRST_WITH_ATTRIBUTES, ID_SECOND_WITH_ATTRIBUTES]
					);
				}
			}
		]
	}
});
