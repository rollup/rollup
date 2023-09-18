const path = require('node:path');

let hasInfinite = false;
const importer = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'allows a plugin to skip its own resolveId hook when using this.resolve',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === 'resolutions') {
						return id;
					}
					if (id.startsWith('test') || id.startsWith('foo') || id.startsWith('bar')) {
						return 'own-resolution';
					}
				},
				load(id) {
					if (id === 'resolutions') {
						return Promise.all([
							this.resolve('bar', importer).then(result => ({ id: result.id, text: 'bar' })),
							this.resolve('foo', importer).then(result => ({ id: result.id, text: 'foo' })),
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
					if (id.startsWith('bar')) {
						return this.resolve('bar', importer);
					}
					if (id.startsWith('foo')) {
						if (hasInfinite) {
							return 'foo-resolution';
						}
						hasInfinite = true;
						return this.resolve('foo', importer, { skipSelf: false });
					}
					if (id.startsWith('test')) {
						return 'other-resolution';
					}
				}
			},
			{
				resolveId(id) {
					if (id.startsWith('bar')) {
						return 'bar-resolution';
					}
				}
			}
		]
	}
});
