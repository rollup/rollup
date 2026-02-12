const assert = require('node:assert/strict');

const programs = [];

module.exports = defineTest({
	description: 'parses a Program',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						Program(node) {
							programs.push(node);
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(programs, [
			{
				type: 'Program',
				start: 0,
				end: 19,
				body: [
					{
						type: 'ExportDefaultDeclaration',
						start: 0,
						end: 18,
						declaration: {
							type: 'Literal',
							start: 15,
							end: 17,
							raw: '42',
							value: 42
						}
					}
				],
				sourceType: 'module'
			}
		]);
	}
});
