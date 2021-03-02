const assert = require('assert');

module.exports = {
	description: 'external function calls marked with pure comment do not have effects and should be removed even if parsed by PluginContext.parse method',
	options: {
		external: ['socks'],
		plugins:[{
			transform(code, _id) {
				const ast = this.parse(code);
				return {ast, code, map: null};
			},
		}],
	},
	context: {
		require(id) {
			if (id === 'socks') {
				return () => {
					throw new Error('Not all socks were removed.');
				};
			}
		}
	},
	code(code) {
		assert.ok(code.search(/socks\(\)/) === -1);
	}
};
