module.exports = defineTest({
	description: 'defaults to rollup.config.js',
	command: 'rollup -c --bundleConfigAsCjs',
	execute: true
});
