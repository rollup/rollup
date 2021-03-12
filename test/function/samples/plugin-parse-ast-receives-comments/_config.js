const assert = require('assert');

const comments = [];

module.exports = {
	description: 'plugin parse ast receives comments',
	options: {
		plugins:[{
			transform(code, _id) {
				const ast = this.parse(code, {
					onComment(...args) {
						comments.push(args);
					},
				});
				return {ast, code, map: null};
			},
		}],
	},
	after() {
		assert.ok(comments.length > 0);
	},
};
