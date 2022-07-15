const path = require('path');

module.exports = {
	description: 'Supports chunk names from config when preserving modules',
	options: {
		input: { 'main-entry': 'main.js' },
		output: {
			preserveModules: true
		},
		plugins: [
			{
				buildStart() {
					this.emitFile({ type: 'chunk', id: path.join(__dirname, 'b.js'), name: 'emitted' });
				}
			}
		]
	}
};
