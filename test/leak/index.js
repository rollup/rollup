const path = require('path');
const rollup = require('../..');

function test() {
	const weak = require('weak');

	let shouldCollect = false;
	let isCollected = false;

	function onCollect () {
		isCollected = true;
	}

	let cache;
	function run () {
		return rollup.rollup({
			entry: path.resolve(__dirname, 'main.js'),
			cache
		}).then(bundle => {
			weak(bundle, onCollect);
			cache = bundle;
			global.gc();
			if (shouldCollect && !isCollected) {
				throw new Error('Memory leak detected');
			}
			shouldCollect = true;
		});
	}

	run()
		.then(run)
		.then(() => {
			console.log('Success');
		})
		.catch(err => {
			console.error(err.message);
			process.exit(1);
		});
}

try {
	require.resolve('weak');
	test();
} catch (err) {
	console.log('installing weak');
	require('child_process').exec('npm i --no-save --silent weak@1.0.1', (err, stdout, stderr) => {
		if (err) {
			console.log('failed to install weak');
		} else {
			test();
		}
	});
}