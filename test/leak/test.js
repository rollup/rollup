var path = require('path')
var rollup = require('../..')

function test() {
	var weak = require('weak');

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
}

try {
	require.resolve('weak');
	test();
} catch (err) {
	console.log('installing weak');
	require('child_process').exec('npm i --no-save --silent weak@1.0.1', function (err, stdout, stderr) {
		if (err) {
			console.log('failed to install weak');
		} else {
			test();
		}
	});
}