module.exports = defineTest({
	description: 'uses correct import.meta.{url,filename,dirname} in config files',
	command: 'rollup -c --bundleConfigAsCjs'
});
