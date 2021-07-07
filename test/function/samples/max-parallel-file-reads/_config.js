const assert = require('assert');

module.exports = {
	description: 'unlimited parallel file reads',
	options: {
		maxParallelFileReads: 3
	},
	bundle(bundle) {
		const maxParallelFileReads = bundle.maxParallelFileReads;
		assert.strictEqual(
			maxParallelFileReads,
			3,
			'Wrong number of parallel file reads: ' + maxParallelFileReads
		);
	}
};
