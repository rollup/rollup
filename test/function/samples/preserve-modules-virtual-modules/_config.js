const assert = require('assert');

module.exports = {
	description: 'Generates actual files for virtual modules when preserving modules',
	options: {
		input: ['main.js'],
		experimentalCodeSplitting: true,
		experimentalPreserveModules: true,
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
		return bundle
			.generate({ format: 'esm' })
			.then(generated =>
				assert.deepEqual(Object.keys(generated.output), [
					'_virtual/_virtualModule',
					'lib/lib.js',
					'main.js'
				])
			);
	}
};
