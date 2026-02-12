const assert = require('node:assert/strict');

const switchCases = [];

module.exports = defineTest({
	description: 'parses a SwitchCase',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						SwitchCase(node) {
							switchCases.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(switchCases, [
			{
				type: 'SwitchCase',
				start: 50,
				end: 74,
				test: {
					type: 'Literal',
					start: 55,
					end: 56,
					raw: '1',
					value: 1
				},
				consequent: [
					{
						type: 'ReturnStatement',
						start: 61,
						end: 74,
						argument: {
							type: 'Literal',
							start: 68,
							end: 73,
							value: 'one',
							raw: "'one'"
						}
					}
				]
			}
		]);
	}
});
