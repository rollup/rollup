module.exports = {
	description: 'allows custom module-specific context with a function option',
	expectedWarnings: ['THIS_IS_UNDEFINED'],
	options: {
		moduleContext(id) {
			return /main\.js$/.test(id) ? 'lolwut' : 'undefined';
		}
	}
};
