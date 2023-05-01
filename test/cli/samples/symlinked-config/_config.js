module.exports = defineTest({
	description: 'loads a symlinked config file',
	command: 'rollup -c --bundleConfigAsCjs',
	execute: true
});
