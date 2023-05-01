module.exports = defineTest({
	description: 'correctly transforms variables in imported expressions',
	options: {
		external: 'external',
		output: {
			globals: { external: 'external' }
		}
	}
});
