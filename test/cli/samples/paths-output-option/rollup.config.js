module.exports = {
	input: 'main.js',
	external: ['foo'],
	output: {
		format: 'cjs',
		paths: {
			foo: 'bar'
		}
	}
};
