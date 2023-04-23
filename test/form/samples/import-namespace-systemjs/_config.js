module.exports = defineRollupTest({
	description: 'imports namespace (systemjs only)',
	options: {
		external: ['dependency'],
		output: {
			format: 'system'
		}
	}
});
