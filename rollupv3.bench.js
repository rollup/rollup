const rollup = require('./node_modules/rollup/dist/rollup.js');

(async () => {
	await rollup.rollup({
		input: 'browser/dist/es/rollup.browser.js'
	});
})();
