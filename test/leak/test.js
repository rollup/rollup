var path = require('path')
var rollup = require('../..')

try {
	var weak = require('weak')

	var shouldCollect = false;
	var isCollected = false;

	function onCollect () {
		isCollected = true;
	}

	var cache;
	function run () {
		return rollup.rollup({
			entry: path.resolve(__dirname, 'index.js'),
			cache
		}).then(function (bundle) {
			weak(bundle, onCollect);
			cache = bundle;
			global.gc();
			if (shouldCollect && !isCollected) {
				throw new Error('Memory leak detected')
			}
			shouldCollect = true;
		});
	};

	run()
		.then(run)
		.then(function () {
			console.log('Success');
		}).
		catch(function (err) {
			console.error(err.message);
			process.exit(1);
		});
} catch (err) {
	if (err.code !== 'MODULE_NOT_FOUND') {
		throw err;
	}

	console.log(`skipping memory leak test`);
}