module.exports = defineTest({
	description: 'uses cjs config file which return config wrapped by defineConfig',
	spawnArgs: ['--config', 'rollup.config.js'],
	execute: true
});
