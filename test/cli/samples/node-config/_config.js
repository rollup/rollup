module.exports = defineRollupTest({
	description: 'uses config file installed from npm',
	command: 'rollup --config node:bar',
	cwd: __dirname,
	execute: true
});
