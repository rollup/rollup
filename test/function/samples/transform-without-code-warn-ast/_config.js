module.exports = defineTest({
	description: 'warns when returning a map but no code from a transform hook',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					return { ast: {} };
				}
			}
		]
	},
	warnings: [
		{
			code: 'NO_TRANSFORM_MAP_OR_AST_WITHOUT_CODE',
			message:
				'The plugin "test-plugin" returned a "map" or "ast" without returning a "code". This will be ignored.'
		}
	]
});
