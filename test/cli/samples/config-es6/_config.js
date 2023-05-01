module.exports = defineTest({
	description: 'uses ES6 module config file',
	command: 'rollup --config rollup.config.js --bundleConfigAsCjs',
	execute: true
});
