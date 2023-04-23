module.exports = defineTest({
	description: 'warns about unknown CLI options',
	command: 'rollup --config rollup.config.js --format es --configAnswer 42 --unknownOption'
});
