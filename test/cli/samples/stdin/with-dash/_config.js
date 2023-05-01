module.exports = defineTest({
	description: 'stdin input with dash on CLI',
	skipIfWindows: true,
	command: `echo "0 && fail() || console.log('PASS');" | rollup -`
});
