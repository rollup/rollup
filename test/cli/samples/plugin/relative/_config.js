module.exports = defineTest({
	description: 'CLI --plugin ../relative/path',
	skipIfWindows: true,
	command: `echo 'console.log(VALUE);' | rollup -p "../absolute/my-plugin={VALUE: 'relative', ZZZ: 1}"`
});
