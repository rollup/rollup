module.exports = defineTest({
	description: 'uses config file installed from npm',
	command: 'rollup --config node:bar',
	cwd: __dirname,
	execute: true
});
