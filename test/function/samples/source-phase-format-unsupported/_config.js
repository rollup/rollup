module.exports = defineTest({
	description: 'throws for source phase imports in non-ES output formats',
	options: {
		external: ['external'],
		output: { format: 'cjs' }
	},
	generateError: {
		code: 'SOURCE_PHASE_FORMAT_UNSUPPORTED',
		message:
			'Source phase imports are not supported for the "cjs" output format, importing "external" in "main.js". Only the "es" output format supports source phase imports.'
	}
});
