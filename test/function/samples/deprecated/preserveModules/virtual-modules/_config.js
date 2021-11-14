const assert = require('assert');

module.exports = {
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
	}
};
