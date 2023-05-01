module.exports = defineTest({
	description: 'CLI --plugin with default export',
	skipIfWindows: true,
	command: `echo 'console.log(VALUE);' | rollup -p "./my-plugin={VALUE: 'default', ZZZ: 1}"`
});
