module.exports = defineRollupTest({
	description: 'merges reexports in systemjs',
	options: {
		external: true,
		output: { format: 'system' }
	}
});
