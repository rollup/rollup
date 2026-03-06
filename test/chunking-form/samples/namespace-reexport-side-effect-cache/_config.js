module.exports = {
	description: 'ensures side-effects are recorded when namespace reexports hit cache (#6274)',
	options: {
		input: ['main1.js', 'main2.js'],
		treeshake: { moduleSideEffects: true }
	}
};
