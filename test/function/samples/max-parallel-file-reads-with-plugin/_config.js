const assert = require('assert');
const fs = require('fs');

const fsReadFile = fs.readFile;
let currentReads = 0;
let maxReads = 0;

module.exports = {
	description: 'maxParallelFileReads with plugin',
	options: {
		maxParallelFileReads: 3,
		plugins: [
			{
				async load(id) {
					return new Promise((fulfil, reject) =>
						fs.readFile(id, 'utf-8', (err, contents) => (err ? reject(err) : fulfil(contents)))
					);
				}
			}
		]
	},
	before() {
		fs.readFile = (path, options, callback) => {
			console.log('mock read');
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
		assert.strictEqual(maxReads, 3, 'Wrong number of parallel file reads: ' + maxReads);
	}
};
