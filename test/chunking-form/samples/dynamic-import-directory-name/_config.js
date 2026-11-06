const fs = require('node:fs');
const path = require('node:path');

// Rollup does not resolve directory imports by itself, so this plugin resolves
// "./dir" to "dir/index.js" the way node resolution plugins do. The last three ids
// have no parent folder and must keep "index" as their chunk name.
const directoryImports = {
	name: 'directory-imports',
	resolveId(source, importer) {
		if (source === 'without-directory') return 'index.js';
		if (source === 'root-index') return '/index.js';
		if (source === 'drive-index') return 'C:/index.js';
		if (!importer || !source.startsWith('.')) return null;
		const directory = path.resolve(path.dirname(importer), source);
		const indexFile = path.join(directory, 'index.js');
		return fs.existsSync(indexFile) ? indexFile : null;
	},
	load(id) {
		if (id === 'index.js') return 'export default "without directory";';
		if (id === '/index.js') return 'export default "root";';
		if (id === 'C:/index.js') return 'export default "drive";';
		return null;
	}
};

module.exports = defineTest({
	description: 'names chunks of dynamically imported directories after the directory',
	options: {
		plugins: [directoryImports]
	}
});
