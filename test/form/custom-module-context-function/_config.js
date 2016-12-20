module.exports = {
	description: 'allows custom module-specific context with a function option',
	options: {
		moduleContext ( id ) {
			return /main\.js$/.test( id ) ? 'lolwut' : 'undefined';
		}
	}
};
