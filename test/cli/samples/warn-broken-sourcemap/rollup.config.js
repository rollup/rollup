module.exports = {
	input: 'main.js',
	plugins: [
		{
			name: 'test-plugin1',
			transform(code) {
				return code + '/*1*/';
			}
		}
	],
	output: {
		format: 'esm',
		file: 'bundle',
		sourcemap: true
	}
};
