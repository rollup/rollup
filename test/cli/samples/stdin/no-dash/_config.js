module.exports = {
	description: 'uses stdin input when piping into Rollup without an input',
	command: `echo "0 && fail() || console.log('PASS');" | rollup`
};
