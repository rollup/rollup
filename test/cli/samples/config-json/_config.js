module.exports = defineTest({
	description: 'allows config file to import json',
	command: 'rollup --config rollup.config.js --bundleConfigAsCjs',
	execute: true
});
