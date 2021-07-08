const assert = require('assert');
const fs = require('fs');

const fsReadFile = fs.readFile;
let currentReads = 0;
let maxReads = 0;

module.exports = {
	description: 'maxParallelFileReads set to infinity',
	options: {
		maxParallelFileReads: 0
	},
	before() {
		fs.readFile = (path, options, callback) => {
			currentReads++;
			maxReads = Math.max(maxReads, currentReads);
			fsReadFile(path, options, (err, data) => {
				currentReads--;
				callback(err, data);
			});
		};
	},
	after() {
		fs.readFile = fsReadFile;
		assert.strictEqual(maxReads, 5, 'Wrong number of parallel file reads: ' + maxReads);
	}
};
