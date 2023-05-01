const assert = require('node:assert');

module.exports = defineTest({
	description: 'Generates actual files for virtual modules when preserving modules',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveModules: true,
		plugins: [
			{
				resolveId(id) {
					if (id === '\0virtualModule') return id;
				},
				load(id) {
					if (id !== '\0virtualModule') return null;
					return 'export const virtual = "Virtual!";\n';
				},
				transform(code, id) {
					if (id === '\0virtualModule') return null;
					return 'import {virtual} from "\0virtualModule";\n' + code;
				}
			}
		]
	},
	bundle(bundle) {
		return bundle.generate({ format: 'es' }).then(generated =>
			assert.deepEqual(
				generated.output.map(chunk => chunk.fileName),
				['main.js', '_virtual/_virtualModule.js', 'lib/lib.js']
			)
		);
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "preserveModules" option is deprecated. Use the "output.preserveModules" option instead.',
			url: 'https://rollupjs.org/configuration-options/#output-preservemodules'
		}
	]
});
