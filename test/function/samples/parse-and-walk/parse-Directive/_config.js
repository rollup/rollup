const assert = require('node:assert/strict');

const directives = [];

module.exports = defineTest({
	description: 'parses a Directive (as ExpressionStatement with directive property)',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform(code) {
					await this.parseAndWalk(code, {
						ExpressionStatement(node) {
							if (node.directive) {
								directives.push(node);
							}
						}
					});
					return null;
				}
			}
		]
	},
	exports() {
		assert.deepEqual(directives, [
			{
				type: 'ExpressionStatement',
				start: 0,
				end: 13,
				directive: 'use strict',
				expression: {
					type: 'Literal',
					start: 0,
					end: 12,
					value: 'use strict',
					raw: '"use strict"'
				}
			}
		]);
	}
});
