module.exports = defineRollupTest({
	description: 'single default export in deep namespace',
	options: { output: { name: 'my.global.namespace' } }
});
