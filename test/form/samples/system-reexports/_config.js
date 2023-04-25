module.exports = defineTest({
	description: 'merges reexports in systemjs',
	options: {
		external: () => true,
		output: { format: 'system' }
	}
});
