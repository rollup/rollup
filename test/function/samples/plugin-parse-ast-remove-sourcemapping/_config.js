const assert = require('node:assert');

module.exports = defineTest({
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
