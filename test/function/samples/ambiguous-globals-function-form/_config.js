const assert = require('node:assert');

const receivedAttributes = [];

module.exports = defineTest({
	description:
		'does not warn when the function form of "output.globals" maps several import attribute variants of the same module to the same global name',
	options: {
		plugins: [
			{
				name: 'resolver',
				resolveId(source) {
					if (source === './logo.png') {
						return { external: true, id: source };
					}
				},
				generateBundle() {
					assert.deepEqual(
						[...receivedAttributes].sort((first, second) => (first.type < second.type ? -1 : 1)),
						[{ type: 'json' }, { type: 'raw' }]
					);
				}
			}
		],
		output: {
			format: 'iife',
			globals(id, { attributes }) {
				assert.equal(id, './logo.png');
				receivedAttributes.push(attributes);
				return 'console';
			}
		}
	}
});
