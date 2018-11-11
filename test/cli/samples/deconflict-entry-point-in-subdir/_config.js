module.exports = {
	description: 'deconflict entry points with the same name in different directories',
	command:
		'rollup --input main.js --input sub/main.js --format esm --dir _actual --experimentalCodeSplitting'
};
