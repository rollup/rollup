module.exports = defineTest({
	description: 'uses cjs config file which returns a Promise',
	command: 'rollup --config rollup.config.cjs',
	execute: true
});
