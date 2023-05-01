module.exports = defineTest({
	description: 'uses mjs config file which returns a Promise',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
