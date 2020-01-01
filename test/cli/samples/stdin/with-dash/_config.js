module.exports = {
	description: 'stdin input with dash on CLI',
	command: `echo "0 && fail() || console.log('PASS');" | rollup -`
};
