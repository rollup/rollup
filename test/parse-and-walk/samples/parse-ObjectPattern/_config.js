const assert = require('node:assert/strict');

const objectPatterns = [];

module.exports = defineTest({
	description: 'parses an ObjectPattern',
	walk: {
		ObjectPattern(node) {
			objectPatterns.push(node);
		}
	},
	assertions() {
		assert.deepEqual(objectPatterns, [
			{
				type: 'ObjectPattern',
				start: 6,
				end: 11,
				properties: [
					{
						type: 'Property',
						start: 8,
						end: 9,
						method: false,
						shorthand: true,
						computed: false,
						key: {
							type: 'Identifier',
							start: 8,
							end: 9,
							name: 'x'
						},
						value: {
							type: 'Identifier',
							start: 8,
							end: 9,
							name: 'x'
						},
						kind: 'init'
					}
				]
			}
		]);
	}
});
