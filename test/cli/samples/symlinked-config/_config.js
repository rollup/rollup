module.exports = defineRollupTest({
	description: 'loads a symlinked config file',
	command: 'rollup -c --bundleConfigAsCjs',
	execute: true
});
