module.exports = defineTest({
	description: 'uses config file which returns a Promise',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
