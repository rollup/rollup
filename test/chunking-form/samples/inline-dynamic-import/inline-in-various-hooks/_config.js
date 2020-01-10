const fs = require('fs');
const path = require('path');

module.exports = {
	description: 'inlines dynamic imports marked for inlining',
	options: {
		input: 'main.js',
		plugins: {
			resolveId(id, importer) {
				if (id.endsWith('dep-inlined-via-resolveId.js')) {
					return this.resolve(id, importer, { skipSelf: true }).then(resolution =>
						Object.assign({}, resolution, { inlineDynamicImport: true })
					);
				}
			},
			load(id) {
				if (id.endsWith('dep-inlined-via-load.js')) {
					return {
						code: fs.readFileSync(path.resolve(__dirname, 'dep-inlined-via-load.js'), {
							encoding: 'utf8'
						}),
						inlineDynamicImport: true
					};
				}
			},
			transform(code, id) {
				if (id.endsWith('dep-inlined-via-transform.js')) {
					return {
						code,
						inlineDynamicImport: true
					};
				}
			}
		}
	}
};
