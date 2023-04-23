module.exports = defineRollupTest({
	description: 'allows custom module-specific context',
	expectedWarnings: ['THIS_IS_UNDEFINED'],
	options: {
		moduleContext: {
			'main.js': 'lolwut'
		}
	}
});
