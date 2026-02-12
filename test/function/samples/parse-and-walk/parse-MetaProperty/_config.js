const assert = require('node:assert/strict');

const metaPropertys = [];

module.exports = defineTest({
	description: 'parses a MetaProperty',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						MetaProperty(node) {
							metaPropertys.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
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
