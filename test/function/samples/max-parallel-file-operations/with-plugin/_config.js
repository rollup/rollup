const assert = require('assert');
const { promises: fs } = require('fs');
const { wait } = require('../../../../utils');

const fsReadFile = fs.readFile;
let currentReads = 0;
let maxReads = 0;

module.exports = {
	description: 'maxParallelFileOps with plugin',
	options: {
		maxParallelFileOps: 3,
		plugins: [
			{
				load(id) {
					return fs.readFile(id, 'utf-8');
				}
			}
		]
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
};
