const assert = require('node:assert/strict');

const privateIdentifiers = [];

module.exports = defineTest({
	description: 'parses a PrivateIdentifier',
	walk: {
		PrivateIdentifier(node) {
			privateIdentifiers.push(node);
		}
	},
	assertions() {
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
