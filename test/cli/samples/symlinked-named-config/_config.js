module.exports = defineTest({
	description: 'loads a symlinked config file with the given name',
	command: 'rollup --config my.rollup.config.js --bundleConfigAsCjs',
	execute: true
});
