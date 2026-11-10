const assert = require('node:assert/strict');
const { assertAstEqual } = require('../../../testHelpers.js');

const decorators = [];
let decoratorParent;

module.exports = defineTest({
	description: 'parses a Decorator',
	walk: {
		Decorator(node) {
			decorators.push(node);
			decoratorParent ||= node.parent;
		}
	},
	assertions() {
		const [decorator] = decorators;
		assert.strictEqual(decoratorParent.type, 'ClassDeclaration');
		assert.strictEqual(decoratorParent.decorators[0], decorator);
		assert.strictEqual(decoratorParent.parent.type, 'Program');
		assert.strictEqual(decorator.expression.parent, decorator);
		assertAstEqual(decorators, [
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
	},
	expectedAst: {
		type: 'Program',
		start: 0,
		end: 52,
		body: [
			{
				type: 'ClassDeclaration',
				start: 0,
				end: 27,
				decorators: [
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
				],
				id: {
					type: 'Identifier',
					start: 17,
					end: 24,
					name: 'MyClass'
				},
				superClass: null,
				body: {
					type: 'ClassBody',
					start: 25,
					end: 27,
					body: []
				}
			},
			{
				type: 'ExportDefaultDeclaration',
				start: 28,
				end: 51,
				declaration: {
					type: 'Identifier',
					start: 43,
					end: 50,
					name: 'MyClass'
				}
			}
		],
		sourceType: 'module'
	}
});
