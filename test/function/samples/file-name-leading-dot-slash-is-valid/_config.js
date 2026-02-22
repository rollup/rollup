const assert = require('node:assert');

module.exports = {
	description: 'allows file names with a leading "./" prefix',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(_options, bundle) {
					bundle['./asset.txt'] = {
						type: 'asset',
						fileName: './asset.txt',
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
