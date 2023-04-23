module.exports = defineRollupTest({
	description: 'allows plugins to set options.entry',
	command: 'rollup -c --bundleConfigAsCjs'
});
