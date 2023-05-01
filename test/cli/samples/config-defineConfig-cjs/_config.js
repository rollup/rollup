module.exports = defineTest({
	description: 'uses cjs config file which return config wrapped by defineConfig',
	command: 'rollup --config rollup.config.js',
	execute: true
});
