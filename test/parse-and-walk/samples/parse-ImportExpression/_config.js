const assert = require('node:assert/strict');

const importExpressions = [];

module.exports = defineTest({
	description: 'parses an ImportExpression',
	walk: {
		ImportExpression(node) {
			importExpressions.push(node);
		}
	},
	assertions() {
		assert.deepEqual(importExpressions, [
			{
				type: 'ImportExpression',
				start: 15,
				end: 33,
				source: {
					type: 'Literal',
					start: 22,
					end: 32,
					value: './dep.js',
					raw: "'./dep.js'"
				},
				options: null
			}
		]);
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 35,
		body: [
			{
				type: 'ExportDefaultDeclaration',
				start: 0,
				end: 34,
				declaration: {
					type: 'ImportExpression',
					start: 15,
					end: 33,
					source: {
						type: 'Literal',
						start: 22,
						end: 32,
						value: './dep.js',
						raw: "'./dep.js'"
					},
					options: null
				}
			}
		],
		sourceType: 'module'
	}
});
