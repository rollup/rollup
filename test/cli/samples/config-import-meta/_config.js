module.exports = defineTest({
	description: 'uses correct import.meta.url in config files',
	command: 'rollup -c --bundleConfigAsCjs'
});
