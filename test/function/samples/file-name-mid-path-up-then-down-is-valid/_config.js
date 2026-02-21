const assert = require('node:assert');

module.exports = {
	description: 'allows file names with ".." that normalize to a path inside the output directory',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						type: 'asset',
						fileName: 'foo/bar/../baz.js',
						source: 'content'
					});
				}
			}
		]
	},
	code(result) {
		assert.ok(result !== null && result !== undefined, 'bundle was generated successfully');
	}
};
