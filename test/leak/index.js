const path = require('path');
const rollup = require('../..');
const weak = require('weak-napi');

var shouldCollect = false;
var isCollected = false;

function onCollect() {
	isCollected = true;
}

const wait = () => new Promise(resolve => setTimeout(resolve));

async function waitForGC() {
	const startTime = process.hrtime();
	do {
		global.gc();
		await wait();
	} while (!isCollected && process.hrtime(startTime)[0] < 3);
}

var cache;
async function run() {
	const bundle = await rollup.rollup({
		input: path.resolve(__dirname, 'main.js'),
		cache
	});
	weak(bundle, onCollect);
	cache = bundle;
	if (shouldCollect) {
		await waitForGC();
		if (!isCollected) {
			throw new Error('Memory leak detected');
		}
	}
	shouldCollect = true;
}

run()
	.then(run)
	.then(() => {
		console.log('Success: Previous bundle was correctly garbage collected.');
		process.exit(0);
	})
	.catch(err => {
		console.error(err.message);
		process.exit(1);
	});
