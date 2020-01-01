module.exports = {
	description: 'uses stdin input when piping into Rollup without an input',
	command: `shx mkdir -p _actual && shx echo "0 && fail() || console.log('PASS');" | rollup > _actual/out.js`
};
