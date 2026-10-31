module.exports = defineTest({
	description: 'preserves line terminators in external module ids',
	options: {
		external: () => true,
		output: { dynamicImportInCjs: false }
	},
	context: {
		require: id => id
	},
	exports: exports => exports
});
