module.exports = {
	input: 'main.js',
	plugins: [
		{
			name: 'test-plugin1',
			transform(code) {
				return code + '/*1*/';
			}
		},
		{
			name: 'test-plugin2',
			transform(code) {
				return code + '/*2*/';
			}
		},
		{
			name: 'test-plugin3',
			transform(code) {
				return code + '/*3*/';
			}
		}
	],
	output: {
		format: 'esm',
		file: 'bundle',
		sourcemap: true
	}
};
