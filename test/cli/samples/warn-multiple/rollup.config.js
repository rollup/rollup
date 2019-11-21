module.exports = {
	input: 'main.js',
	external: ['url', 'assert', 'external'],
	plugins: [
		{
			buildStart() {
				this.warn('Plugin warning.');
			}
		}
	],
	output: {
		name: 'bundle',
		format: 'iife'
	}
};
