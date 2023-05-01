module.exports = defineTest({
	description: 'supports opt-ing out of usage of Object.freeze',
	options: {
		output: { name: 'myBundle', freeze: false }
	}
});
