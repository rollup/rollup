module.exports = {
	description: 'stdin input with no dash on CLI',
	command: `shx mkdir -p _actual && shx echo "0 && fail() || console.log('PASS');" | rollup > _actual/out.js`
};
