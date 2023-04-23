const { join, dirname } = require('node:path').posix;

module.exports = defineTest({
	description: 'renormalizes external paths if possible',
	options: {
		input: ['/main.js', '/nested/entry.js'],
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
						return `import './nested/dep.js';
import './ext.js';
import './nested/nested-ext.js';`;
					}
					case '/dep.js': {
						return `import './ext.js';
import './nested/nested-ext.js';`;
					}
					case '/nested/dep.js': {
						return `import '../ext.js';
import './nested-ext.js';`;
					}
					case '/nested/entry.js': {
						return `import '../dep.js';
import '../ext.js';
import './nested-ext.js';`;
					}
					default: {
						throw new Error(`Unexpected id ${id}`);
					}
				}
			}
		}
	}
});
