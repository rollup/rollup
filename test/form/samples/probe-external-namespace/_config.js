module.exports = defineTest({
	description: 'allow probing external namespaces without causing errors due to missing imports',
	options: {
		external: 'external',
		output: { globals: { external: 'external' } }
	}
});
