const path = require('node:path');

module.exports = defineTest({
	description: 'completes when a load hook awaits this.load with maxParallelFileOps: 1',
	options: {
		maxParallelFileOps: 1,
		plugins: [
			{
				async load(id) {
					if (id.endsWith('main.js')) {
						await this.load({ id: path.join(__dirname, 'dep.js') });
					}
				}
			}
		]
	}
});
