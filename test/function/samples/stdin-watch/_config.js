module.exports = {
	description: 'throws when using the "watch" option with stdin "-"',
	options: {
		input: '-',
		watch: true
	},
	error: {
		// TODO add an error code
		message: 'watch mode is incompatible with stdin input'
	}
};
