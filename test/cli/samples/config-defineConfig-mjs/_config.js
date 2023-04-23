module.exports = defineRollupTest({
	description: 'uses mjs config file which return config wrapped by defineConfig',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
