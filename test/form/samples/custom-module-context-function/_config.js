module.exports = defineTest({
	description: 'allows custom module-specific context with a function option',
	expectedWarnings: ['THIS_IS_UNDEFINED'],
	options: {
		moduleContext(id) {
			if (id.endsWith('main.js')) {
				return 'window';
			}
			if (id.endsWith('foo.js')) {
				return 'global';
			}
		}
	}
});
