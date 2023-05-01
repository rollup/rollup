const assert = require('node:assert');

module.exports = defineTest({
	description: 'Adds timing information to bundle when bundling with perf=true',
	options: {
		input: ['main.js', 'main2.js'],
		perf: true
	},
	bundle(bundle) {
		const timings = bundle.getTimings();
		const timers = Object.keys(timings);
		assert.ok(timers.includes('# BUILD'), '# BUILD time is not measured.');
		assert.ok(timers.includes('# GENERATE'), '# GENERATE time is not measured.');
		for (const timer of timers) {
			assert.equal(typeof timings[timer][0], 'number');
			assert.equal(typeof timings[timer][1], 'number');
			assert.ok(timings[timer][0] >= 0, 'Timer is not non-negative.');
		}
	}
});
