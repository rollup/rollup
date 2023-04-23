module.exports = defineRollupTest({
	description: 'uses config file (.mjs)',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
