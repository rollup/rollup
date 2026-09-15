const { Volume } = require('memfs');

module.exports = defineTest({
	description:
		'resolves relative imports against the directory of an importer whose id ends with a slash',
	options: {
		input: '/a/b/',
		plugins: {
			name: 'test-plugin',
			resolveId(source) {
				if (source === '/a/b/') return source;
			},
			load(id) {
				if (id === '/a/b/') {
					return `import { dep } from './dep.js';
console.log(dep);`;
				}
			}
		},
		fs: Volume.fromJSON({
			'/a/dep.js': `export const dep = 'resolved against /a';`
		}).promises
	}
});
