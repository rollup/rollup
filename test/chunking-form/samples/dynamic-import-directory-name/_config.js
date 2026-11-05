const fs = require('node:fs');
const path = require('node:path');

// Rollup does not resolve directory imports by itself, so this plugin resolves
// "./dir" to "dir/index.js" the way node resolution plugins do. "without-directory"
// is an id without a parent directory: its chunk keeps the plain name.
const directoryImports = {
	name: 'directory-imports',
	resolveId(source, importer) {
		if (source === 'without-directory') return 'index.js';
		if (!importer || !source.startsWith('.')) return null;
		const directory = path.resolve(path.dirname(importer), source);
		const indexFile = path.join(directory, 'index.js');
		return fs.existsSync(indexFile) ? indexFile : null;
	},
	load(id) {
		if (id === 'index.js') return 'export default "without directory";';
		return null;
	}
};

module.exports = defineTest({
	description: 'names chunks of dynamically imported directories after the directory',
	options: {
		plugins: [directoryImports]
	}
});
