module.exports = {
	description: 'imports from pure external modules that are used should not be omitted',
	options: {
		external: ['warning'],
		treeshake: {
			pureExternalModules: ['warning']
		}
	},
	context: {
		require: id => {
			if (id === 'warning') return arg => console.log(arg);
			throw new Error('Unexpected import', id);
		}
	}
};
