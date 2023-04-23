const path = require('node:path');

module.exports = defineTest({
	description: 'allows a plugin to skip its own resolveId hook when using this.resolve',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === 'resolutions') {
						return id;
					}
					if (id.startsWith('test')) {
						return 'own-resolution';
					}
				},
				load(id) {
					if (id === 'resolutions') {
						const importer = path.join(__dirname, 'main.js');
						return Promise.all([
							this.resolve('test', importer).then(result => ({ id: result.id, text: 'all' })),
							this.resolve('test', importer, { skipSelf: false }).then(result => ({
								id: result.id,
								text: 'unskipped'
							})),
							this.resolve('test', importer, { skipSelf: true }).then(result => ({
								id: result.id,
								text: 'skipped'
							}))
						]).then(result => `export default ${JSON.stringify(result)};`);
					}
				}
			},
			{
				resolveId(id) {
					if (id.startsWith('test')) {
						return 'other-resolution';
					}
				}
			}
		]
	}
});
