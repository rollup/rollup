const path = require('node:path');

module.exports = {
	input: 'main.js',
	plugins: [
		{
			name: 'test-plugin',
			buildStart() {
				this.warn('First');
				this.warn({ message: 'Second', url: 'https://information' });
				this.warn({ message: 'Second', url: 'https://information' });
			}
		}
	],
	output: {
		format: 'es',
		plugins: [
			{
				name: 'second-plugin',
				renderStart() {
					this.warn({ message: 'Third', id: path.resolve(__dirname, 'other.js') });
					this.warn({
						message: 'Fourth',
						id: path.resolve(__dirname, 'other.js'),
						loc: { line: 1, column: 2 },
						frame: 'custom frame'
					});
					this.info({ message: 'Fifth', id: path.resolve(__dirname, 'other.js') });
				}
			}
		]
	}
};
