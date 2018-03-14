module.exports = {
	description: 'missing export',
	options: {
		input: ['main.js', 'dep2.js'],
		plugins: [
			{
				missingExport() {
					return true;
				}
			}
		]
	}
};
