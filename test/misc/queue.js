const assert = require('assert');
const rewire = require('rewire');
const { assertIncludes, loader } = require('../utils.js');
const rollup = rewire('../../dist/shared/rollup');

const Queue = rollup.__get__('Queue');

describe('queue', () => {
	it('max parallel execution', async () => {
		let concurrency = 0,
			maxConcurrency = 0;
		const q = new Queue(5);
		const promises = Array(10)
			.fill(0)
			.map(() =>
				q.run(async () => {
					concurrency++;
					maxConcurrency = Math.max(concurrency, maxConcurrency);
					await Promise.resolve();
					concurrency--;
				})
			);

		await Promise.all(promises);
		assert.strictEqual(maxConcurrency, 5, 'maxConcurrency is not 5: ' + maxConcurrency);
	});

	it('forwards errors', () => {
		const q = new Queue(5);
		const promise = q.run(() => Promise.reject(42));
		assert.rejects(promise, 'Should reject');
	});
});
