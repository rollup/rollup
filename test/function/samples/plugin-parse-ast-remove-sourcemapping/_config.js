const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'remove source mapping comment even if code is parsed by PluginContext.parse method',
	options: {
		plugins: [
			{
				transform(code) {
					const ast = this.parse(code);
					return { ast, code, map: null };
				}
			}
		]
	},
	code(code) {
		assert.ok(code.search(/sourceMappingURL/) === -1);
	}
});
