const assert = require('node:assert/strict');

const assignmentPatterns = [];

module.exports = defineTest({
	description: 'parses an AssignmentPattern',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						AssignmentPattern(node) {
							assignmentPatterns.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(assignmentPatterns, [
			{
				type: 'AssignmentPattern',
				start: 28,
				end: 33,
				left: { type: 'Identifier', start: 28, end: 29, name: 'x' },
				right: { type: 'Literal', start: 32, end: 33, raw: '1', value: 1 }
			}
		]);
	}
});
