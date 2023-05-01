module.exports = defineTest({
	description: 'deconflict entry points with the same name in different directories',
	command: 'rollup --input main.js --input sub/main.js --format es --dir _actual'
});
