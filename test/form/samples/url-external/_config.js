module.exports = defineTest({
	description: 'supports URL externals',
	options: {
		external: ['https://external.com/external.js'],
		output: {
			globals: { 'https://external.com/external.js': 'external' }
		}
	}
});
