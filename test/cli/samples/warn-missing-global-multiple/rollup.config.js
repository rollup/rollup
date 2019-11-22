module.exports = {
	input: 'main.js',
	external: ['external1', 'external2', 'external3'],
	output: {
		format: 'iife',
		name: 'bundle'
	}
};
