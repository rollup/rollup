const path = require('node:path');

const manualEntry = path.join(__dirname, 'manual-entry.js');

module.exports = defineTest({
	description: 'handles manual chunks where the root is not part of the module graph',
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['manual-entry.js']
			}
		},
		plugins: [
			{
				load() {
					this.emitFile({
						id: manualEntry,
						type: 'chunk',
						name: 'manual-entry.js'
					});
				}
			}
		]
	}
});
