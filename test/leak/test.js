const path = require('path')
const weak = require('weak')
const rollup = require('../..')

let shouldCollect = false;
let isCollected = false;

const onCollect = () => isCollected = true;

let cache;
const run = () => rollup.rollup({
	entry: path.resolve(__dirname, 'index.js'),
	cache
}).then(bundle => {
	weak(bundle, onCollect);
	cache = bundle;
	global.gc();
	if (shouldCollect && !isCollected) {
		throw new Error('Memory leak detected')
	}
	shouldCollect = true;
})

run().then(run).then(() => console.log('Success')).catch((err) => {
	console.error(err.message);
	process.exit(1);
});