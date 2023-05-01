module.exports = defineTest({
	description:
		'return statements do not have side-effects but should be kept in certain cases (#1585)',
	options: { output: { name: 'myBundle' } }
});
