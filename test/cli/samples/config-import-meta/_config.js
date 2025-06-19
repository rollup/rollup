module.exports = defineTest({
	description: 'uses correct import.meta.{url,filename,dirname} in config files',
	spawnArgs: ['-c', '--bundleConfigAsCjs']
});
