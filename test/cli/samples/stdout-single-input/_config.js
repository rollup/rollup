module.exports = defineRollupTest({
	description: 'bundles a single input to stdout without modifications',
	command: 'rollup -i main.js -f es -m inline'
});
