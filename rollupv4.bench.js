const rollup = require('rollup');

(async () => {
	await rollup.rollup({
		input: 'browser/dist/es/rollup.browser.js'
	});
})();
