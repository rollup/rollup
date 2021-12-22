const assert = require('assert');
const { promises } = require('fs');

const fsReadFile = promises.readFile;
let currentReads = 0;
let maxReads = 0;

module.exports = {
	description: 'maxParallelFileReads with plugin',
	options: {
		maxParallelFileReads: 3,
		plugins: [
			{
				load(id) {
					return promises.readFile(id, 'utf-8');
				}
			}
		]
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
