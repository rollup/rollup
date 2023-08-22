module.exports = defineTest({
	description: 'uses mjs config file which return config wrapped by defineConfig',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
