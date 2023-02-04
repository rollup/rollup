export default {
	input: 'main.js',
	plugins: [
		{
			name: 'faulty-close',
			closeBundle() {
				throw new Error('Close bundle failed');
			}
		}
	],
	output: {
		dir: '_actual',
		format: 'es'
	}
};
