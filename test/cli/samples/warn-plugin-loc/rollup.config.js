const path = require('path');

module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [
		{
			name: 'test',
			buildStart() {
				this.warn({
					message: 'Warning with file and id',
					file: path.join(__dirname, 'file-id1'),
					loc: { file: path.join(__dirname, 'file1'), line: 1, column: 2 }
				});
				this.warn({
					message: 'Warning with file',
					loc: { file: path.join(__dirname, 'file2'), line: 2, column: 3 }
				});
				this.warn({
					message: 'Warning with id',
					id: path.join(__dirname, 'file-id3'),
					loc: { line: 3, column: 4 }
				});
			}
		}
	]
};
