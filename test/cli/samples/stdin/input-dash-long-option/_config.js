module.exports = defineTest({
	description: 'uses stdin input via "--input -"',
	skipIfWindows: true,
	command: `echo "0 && fail() || console.log('PASS');" | rollup --input - -f es`
});
