module.exports = defineRollupTest({
	description: 'the parameter of a catch block should correctly shadow an import (#1391)',
	options: { output: { name: 'bundle' } }
});
