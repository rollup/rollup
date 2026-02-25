module.exports = defineTest({
	description: 'throws for source phase imports in non-ES output formats',
	options: {
		external: ['external'],
		output: { format: 'cjs' }
	},
	generateError: {
		code: 'SOURCE_PHASE_FORMAT_UNSUPPORTED',
		message:
			'Source phase imports are not supported for the "cjs" output format, importing "external" in "main.js". Use the "es" output format to support source phase imports.',
		url: 'https://rollupjs.org/es-module-syntax/#source-phase-import'
	}
});
