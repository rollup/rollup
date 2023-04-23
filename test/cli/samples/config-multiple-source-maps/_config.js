module.exports = defineTest({
	description: 'correctly generates sourcemaps for multiple outputs',
	command: 'rollup -c --bundleConfigAsCjs'
});
