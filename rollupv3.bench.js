const rollup = require('./node_modules/rollup/dist/rollup.js');

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
