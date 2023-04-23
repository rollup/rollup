module.exports = defineTest({
	description: 'imports namespace (systemjs only)',
	options: {
		external: ['dependency'],
		output: {
			format: 'system'
		}
	}
});
