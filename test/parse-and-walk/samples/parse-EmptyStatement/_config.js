const assert = require('node:assert/strict');

const emptyStatements = [];

module.exports = defineTest({
	description: 'parses an EmptyStatement',
	walk: {
		EmptyStatement(node) {
			emptyStatements.push(node);
		}
	},
	assertions() {
		assert.deepEqual(emptyStatements, [
			{
				type: 'EmptyStatement',
				start: 0,
				end: 1
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 23,
		body: [
			{
				type: 'EmptyStatement',
				start: 0,
				end: 1
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 2,
				end: 22,
				declaration: {
					type: 'Literal',
					start: 17,
					end: 21,
					raw: 'null',
					value: null
				}
			}
		],
		sourceType: 'module'
	}
});
