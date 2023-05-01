module.exports = defineTest({
	description: 'disables indentation with --no-indent',
	command: 'rollup main.js --format umd --no-indent'
});
