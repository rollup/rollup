const assert = require('assert');

module.exports = {
	description: 'limit parallel file reads',
	options: {
		maxParallelFileReads: 0
	},
	bundle(bundle) {
		const maxParallelFileReads = bundle.maxParallelFileReads;
		assert.strictEqual(
			maxParallelFileReads,
			5,
			'Wrong number of parallel file reads: ' + maxParallelFileReads
		);
	}
};
