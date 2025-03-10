const assert = require('node:assert');
const { promises: fs } = require('node:fs');
const { wait } = require('../../../../testHelpers');

const fsReadFile = fs.readFile;
let currentReads = 0;
let maxReads = 0;

module.exports = defineTest({
	description: 'maxParallelFileOps set to 3',
	options: {
		maxParallelFileOps: 3
	},
	before() {
		fs.readFile = async (path, options) => {
			currentReads++;
			maxReads = Math.max(maxReads, currentReads);
			const content = await fsReadFile(path, options);
			await wait(50);
			currentReads--;
			return content;
		};
	},
	after() {
		fs.readFile = fsReadFile;
		assert.strictEqual(maxReads, 3, 'Wrong number of parallel file reads: ' + maxReads);
	}
});
