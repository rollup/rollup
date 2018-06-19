module.exports = {
	options: {
		input: ['main.js', 'foo.js'],
		external: ['external'],
		treeshake: {
			pureExternalModules: true
		}
	},
	description: 'prunes pure unused external imports ([#1352])'
};
