const assert = require('node:assert/strict');

const metaPropertys = [];

module.exports = defineTest({
	description: 'parses a MetaProperty',
	walk: {
		MetaProperty(node) {
			metaPropertys.push(node);
		}
	},
	assertions() {
		assert.deepEqual(metaPropertys, [
			{
				type: 'MetaProperty',
				start: 26,
				end: 36,
				meta: {
					type: 'Identifier',
					start: 26,
					end: 29,
					name: 'new'
				},
				property: {
					type: 'Identifier',
					start: 30,
					end: 36,
					name: 'target'
				}
			}
		]);
	}
});
