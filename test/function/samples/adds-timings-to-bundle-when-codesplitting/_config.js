const assert = require('assert');

module.exports = {
	description: 'Adds timing information to bundle when bundling with perf=true',
	options: {
		input: ['main1.js', 'main2.js'],
		experimentalCodeSplitting: true,
		perf: true
	},
	bundle(bundle) {
		const timings = bundle.getTimings();
		const timers = Object.keys(timings);
		assert.ok(timers.indexOf('# BUILD') >= 0, '# BUILD time is not measured.');
		assert.ok(timers.indexOf('# GENERATE') >= 0, '# GENERATE time is not measured.');
		timers.forEach(timer => {
			assert.equal(typeof timings[timer][0], 'number');
			assert.equal(typeof timings[timer][1], 'number');
			assert.ok(timings[timer][0] >= 0, 'Timer is not non-negative.');
		});
	}
};
