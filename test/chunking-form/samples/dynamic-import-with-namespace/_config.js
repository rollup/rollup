const fs = require('node:fs');
const path = require('node:path');

const moduleContent = fs.readFileSync(path.resolve(__dirname, './module.js'), 'utf8');
let count = 1;
module.exports = defineTest({
	description: 'The all cases of tree-shaking for dynamic import with namespace',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id.startsWith('./module')) return id + count++;
					return this.resolve(id);
				},
				load(id) {
					if (id.endsWith('main.js')) return null;
					return moduleContent;
				}
			}
		]
	}
});
