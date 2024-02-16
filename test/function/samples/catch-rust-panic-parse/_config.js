module.exports = defineTest({
	description: 'Catch Rust panics and then throw them in Node when using this.parse',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.parse(`const foo = { bar = baz };`);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'not implemented: Cannot convert Prop::Assign',
		plugin: 'test',
		pluginCode: 'PARSE_ERROR',
		pos: undefined
	}
});
