module.exports = defineTest({
	description: 'avoids hoisting transitive dependencies via flag',
	options: {
		input: ['main1.js', 'main2.js'],
		external: ['lib'],
		output: {
			hoistTransitiveImports: false
		}
	}
});
