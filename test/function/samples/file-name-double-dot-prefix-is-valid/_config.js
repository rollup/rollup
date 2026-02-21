const assert = require('node:assert');

module.exports = {
	description: 'allows file names that start with ".." but are not path traversal sequences',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['..foo.js'] = {
						type: 'asset',
						fileName: '..foo.js',
						name: undefined,
						needsCodeReference: false,
						names: [],
						originalFileNames: [],
						source: 'content'
					};
				}
			}
		]
	},
	code(result) {
		assert.ok(result !== null && result !== undefined, 'bundle was generated successfully');
	}
};
