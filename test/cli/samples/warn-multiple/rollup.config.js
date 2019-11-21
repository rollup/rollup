module.exports = {
	input: 'main.js',
	external: ['url', 'assert', 'path'],
	output: {
		name: 'bundle',
		format: 'amd'
	}
};
