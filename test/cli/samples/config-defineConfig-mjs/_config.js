module.exports = defineTest({
	// TODO SWC fix ESM build
	skip: true,
	description: 'uses mjs config file which return config wrapped by defineConfig',
	command: 'rollup --config rollup.config.mjs',
	execute: true
});
