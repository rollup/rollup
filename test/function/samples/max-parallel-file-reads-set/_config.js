const assert = require('assert');
const { promises } = require('fs');

const fsReadFile = promises.readFile;
let currentReads = 0;
let maxReads = 0;

module.exports = {
	description: 'maxParallelFileReads set to 3',
	options: {
		maxParallelFileReads: 3
	},
	before() {
		promises.readFile = async (path, options) => {
			currentReads++;
			maxReads = Math.max(maxReads, currentReads);
			const content = await fsReadFile(path, options);
			currentReads--;
			return content;
		};
	},
	after() {
		promises.readFile = fsReadFile;
		assert.strictEqual(maxReads, 3, 'Wrong number of parallel file reads: ' + maxReads);
	}
};
