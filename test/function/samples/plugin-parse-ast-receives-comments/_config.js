const assert = require('node:assert');

const comments = [];

module.exports = defineRollupTest({
	description: 'plugin parse ast receives comments',
	options: {
		plugins: [
			{
				transform(code) {
					const ast = this.parse(code, {
						onComment(...parameters) {
							comments.push(parameters);
						}
					});
					return { ast, code, map: null };
				}
			}
		]
	},
	after() {
		assert.ok(comments.length > 0);
	}
});
