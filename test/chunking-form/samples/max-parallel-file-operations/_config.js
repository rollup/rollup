const assert = require('node:assert');
const { promises: fs } = require('node:fs');
const { wait } = require('../../../testHelpers');

const fsWriteFile = fs.writeFile;
let currentWrites = 0;
let maxWrites = 0;

module.exports = defineTest({
	description: 'maxParallelFileOps limits write operations',
	options: {
		maxParallelFileOps: 3,
		output: { preserveModules: true },
		fs
	},
	before() {
		fs.writeFile = async (path, content) => {
			currentWrites++;
			maxWrites = Math.max(maxWrites, currentWrites);
			await fsWriteFile(path, content);
			await wait(50);
			currentWrites--;
		};
	},
	after() {
		fs.writeFile = fsWriteFile;
		assert.strictEqual(maxWrites, 3, 'Wrong number of parallel file writes: ' + maxWrites);
	}
});
