module.exports = {
	description: 'confirm export aliases are preserved in modules',
	options: {
		input: ['main1.js', 'main2.js'],
		experimentalPreserveModules: true
	}
};
