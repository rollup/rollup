module.exports = defineTest({
	description: 'uses stdin input when piping into Rollup without an input',
	skipIfWindows: true,
	command: `echo "0 && fail() || console.log('PASS');" | rollup`
});
