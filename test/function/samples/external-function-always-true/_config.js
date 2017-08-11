module.exports = {
	description: 'prints useful error if external returns true for entry (#1264)',
	options: {
		external: id => true
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Entry module cannot be external'
	}
};
