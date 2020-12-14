export default {
	input: 'main.js',
	plugins: [
		{
			name: 'faulty-close',
			closeBundle() {
				console.error('Bundle closed')
			}
		}
	],
	output: {
		format: "es"
	}
};
