module.exports = defineTest({
	description: 'allows reexporting from other entry points',
	options: {
		input: ['main', 'otherEntry']
	}
});
