const path = require('node:path');
const weak = require('weak-napi');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const rollup = require('../..');
const { wait } = require('../utils');

var shouldCollect = false;
var isCollected = false;

function onCollect() {
	isCollected = true;
}

async function waitForGC() {
	const startTime = process.hrtime();
	do {
		global.gc();
		await wait(0);
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
	.catch(error => {
		console.error(error.message);
		process.exit(1);
	});
