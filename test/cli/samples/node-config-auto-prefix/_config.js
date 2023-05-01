module.exports = defineTest({
	description: 'uses config file installed from npm, automatically adding a rollup-config- prefix',
	command: 'rollup --config node:foo',
	execute: true
});
