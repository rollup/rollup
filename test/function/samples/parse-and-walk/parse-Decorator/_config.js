const assert = require('node:assert/strict');

const decorators = [];

module.exports = defineTest({
	description: 'parses a Decorator',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						Decorator(node) {
							decorators.push(node);
						}
					});
					return 'export default class MyClass {}';
				}
			}
		]
	},
	exports() {
		assert.deepEqual(decorators, [
			{
				type: 'Decorator',
				start: 0,
				end: 10,
				expression: {
					type: 'Identifier',
					start: 1,
					end: 10,
					name: 'decorator'
				}
			}
		]);
	}
});
