const path = require('path');

module.exports = {
	description: 'external paths from custom resolver remain external (#633)',
	options: {
		external: (_id, parent) => parent === 'dep',
		plugins: [
			{
				resolveId(id, parent) {
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
		message:
			"'dep' is imported as an external by dep, but is already an existing non-external module id.",
		watchFiles: [path.resolve(__dirname, 'main.js'), 'dep']
	}
};
