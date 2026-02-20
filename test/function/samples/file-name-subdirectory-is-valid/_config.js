const assert = require('node:assert');

module.exports = {
	description: 'allows file names with subdirectories within the output directory',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						type: 'asset',
						fileName: 'sub/dir/asset.txt',
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
