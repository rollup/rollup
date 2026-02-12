const assert = require('node:assert/strict');

const privateIdentifiers = [];

module.exports = defineTest({
	description: 'parses a PrivateIdentifier',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						PrivateIdentifier(node) {
							privateIdentifiers.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(privateIdentifiers, [
			{
				type: 'PrivateIdentifier',
				start: 24,
				end: 37,
				name: 'privateField'
			},
			{
				type: 'PrivateIdentifier',
				start: 69,
				end: 82,
				name: 'privateField'
			}
		]);
	}
});
