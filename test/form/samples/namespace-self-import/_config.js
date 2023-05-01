module.exports = defineTest({
	description: 'namespace early import hoisting',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		output: {
			name: 'iife'
		}
	}
});
