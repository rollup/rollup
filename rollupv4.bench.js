const rollup = require('rollup');

(async () => {
	console.log(
		(
			await rollup.rollup({
				input: 'browser/dist/es/rollup.browser.js',
				perf: true
			})
		).getTimings()
	);
})();
