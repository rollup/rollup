module.exports = defineTest({
	description: 'uses correct names when reexporting from namespace reexports (#4049)',
	options: { external: 'external', output: { name: 'bundle' } }
});
