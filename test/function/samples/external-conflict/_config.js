const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'external paths from custom resolver remain external (#633)',
	options: {
		external: (_id, parent) => parent === 'dep',
		plugins: [
			{
				resolveId(id) {
					if (id === 'dep') return id;
				},
				load(id) {
					if (id === 'dep') return `import 'dep'`;
				}
			}
		]
	},
	error: {
		code: 'INVALID_EXTERNAL_ID',
		watchFiles: [ID_MAIN, 'dep'],
		message:
			'"dep" is imported as an external by "dep", but is already an existing non-external module id.'
	}
});
