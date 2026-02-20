const { join, dirname } = require('node:path').posix;

module.exports = defineTest({
	description:
		'clamps at root when renormalizing external paths that traverse past the root via resolve',
	options: {
		input: '/main.js',
		external(id) {
			return id.endsWith('ext');
		},
		plugins: {
			name: 'test-plugin',
			resolveId(source, importer) {
				if (source.endsWith('ext.js')) {
					return false;
				}
				if (!importer) {
					return source;
				}
				return join(dirname(importer), source);
			},
			load(id) {
				switch (id) {
					case '/main.js': {
						// dep.js is at root; the external is imported via '../../escaped-ext.js'
						// from dep.js — two levels up from '/' — which should clamp to '/escaped-ext.js'
						return `import './dep.js';`;
					}
					case '/dep.js': {
						return `import '../../escaped-ext.js';`;
					}
					default: {
						throw new Error(`Unexpected id ${id}`);
					}
				}
			}
		}
	}
});
