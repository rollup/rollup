module.exports = defineTest({
	description: 'generates UMD export with correct name',
	command: 'rollup main.js --format umd --name myBundle --indent'
});
