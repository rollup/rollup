module.exports = defineTest({
	description: 'generates namespace objects when not tree-shaking',
	options: {
		treeshake: false
	}
});
