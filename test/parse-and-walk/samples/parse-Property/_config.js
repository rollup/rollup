const assert = require('node:assert/strict');

const propertys = [];

module.exports = defineTest({
	description: 'parses a Property',
	walk: {
		Property(node) {
			propertys.push(node);
		}
	},
	assertions() {
		assert.deepEqual(propertys, [
			{
				type: 'Property',
				start: 17,
				end: 21,
				method: false,
				shorthand: false,
				computed: false,
				key: {
					type: 'Identifier',
					start: 17,
					end: 18,
					name: 'x'
				},
				value: {
					type: 'Literal',
					start: 20,
					end: 21,
					raw: '1',
					value: 1
				},
				kind: 'init'
			}
		]);
	}
});
