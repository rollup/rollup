const path = require('path');
const rollup = require('../..');
const weak = require('weak');

var shouldCollect = false;
var isCollected = false;

function onCollect() {
	isCollected = true;
}

var cache;
function run() {
	return rollup
		.rollup({
			input: path.resolve(__dirname, 'main.js'),
			cache
		})
		.then(bundle => {
			weak(bundle, onCollect);
			cache = bundle.cache;
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
		console.log('Success: No memory leak detected');
	})
	.catch(err => {
		console.error(err.message);
		process.exit(1);
	});
