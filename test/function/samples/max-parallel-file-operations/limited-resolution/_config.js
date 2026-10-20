const assert = require('node:assert');
const { promises: fs } = require('node:fs');
const { wait } = require('../../../../testHelpers');

const lstat = fs.lstat.bind(fs);
const readdir = fs.readdir.bind(fs);
let currentOperations = 0;
let maxOperations = 0;

const trackOperation = async operation => {
	currentOperations++;
	maxOperations = Math.max(maxOperations, currentOperations);
	try {
		await wait(50);
		return await operation();
	} finally {
		currentOperations--;
	}
};

module.exports = defineTest({
	description: 'limits parallel resolution file operations with maxParallelFileOps',
	options: {
		maxParallelFileOps: 2,
		fs: {
			...fs,
			lstat: path => trackOperation(() => lstat(path)),
			readdir: (path, options) => trackOperation(() => readdir(path, options))
		}
	},
	after() {
		assert.strictEqual(
			maxOperations,
			2,
			'Wrong number of parallel file operations: ' + maxOperations
		);
	}
});
