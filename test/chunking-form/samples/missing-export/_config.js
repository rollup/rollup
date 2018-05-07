module.exports = {
	description: 'missing export',
	options: {
		input: [
			'main.js',
			'd1.js',
			'd2.js',
			'd3.js'
		],
		shimMissingExports: true
	}
};
