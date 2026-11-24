module.exports = defineTest({
	description: 'uses stdin input via "--input -" together with an output file',
	skipIfWindows: true,
	command: `echo "export const s = 1;" | rollup --format es --file _actual/out.mjs --input -`
});
