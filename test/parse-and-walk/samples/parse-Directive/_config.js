const assert = require('node:assert/strict');

const directives = [];

module.exports = defineTest({
	description: 'parses a Directive (as ExpressionStatement with directive property)',
	walk: {
		ExpressionStatement(node) {
			if (node.directive) {
				directives.push(node);
			}
		}
	},
	assertions() {
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
