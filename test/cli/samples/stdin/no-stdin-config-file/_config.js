module.exports = defineTest({
	description: 'allows using "-" as a regular file name via flag',
	skipIfWindows: true,
	command: `echo "console.log('IGNORED');" | rollup -c --no-stdin`
});
