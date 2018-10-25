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
					if (id === '\0virtualModule.js') return id;
				},
				load(id) {
					if (id !== '\0virtualModule.js') return null;
					return 'export const virtual = "Virtual!";\n';
				},
				transform(code, id) {
					if (id === '\0virtualModule.js') return null;
					return 'import {virtual} from "\0virtualModule.js";\n' + code;
				}
			}
		]
	},
	bundle(bundle) {
		return bundle
			.generate({ format: 'esm' })
			.then(generated =>
				assert.deepEqual(Object.keys(generated.output), [
					'_virtual/_virtualModule.js',
					'_virtual/_virtualModule2.js',
					'main.js'
				])
			);
	}
};
