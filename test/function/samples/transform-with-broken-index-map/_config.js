const path = require('node:path');

module.exports = defineTest({
	description: 'throws a plugin error when a transform map has broken index sections',
	options: {
		plugins: [
			{
				name: 'broken index map',
				transform(code) {
					return { code, map: { version: 3, sections: 'nope' } };
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		message: "Cannot destructure property 'sourceRoot' of 'section' as it is null.",
		plugin: 'broken index map',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
});
