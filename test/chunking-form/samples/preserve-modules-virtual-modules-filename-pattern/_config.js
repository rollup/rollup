module.exports = defineTest({
	description:
		'Generates actual files whose filename adheres to entryFileNames for virtual modules when preserving modules',
	options: {
		input: 'main.js',
		output: {
			preserveModules: true,
			entryFileNames: '[name]-[format]-[hash].mjs'
		},
		plugins: [
			{
				resolveId(id) {
					if (id === '\0virtualModule') return id;
					if (id === '\0virtualWithExt.js') return id;
					if (id === '\0virtualWithAssetExt.str') return id;
				},
				load(id) {
					if (id === '\0virtualModule') return 'export const virtual = "Virtual!";\n';
					if (id === '\0virtualWithExt.js') return 'export const virtual2 = "Virtual2!";\n';
					if (id === '\0virtualWithAssetExt.str') return 'export const virtual3 = "Virtual3!";\n';
				},
				transform(code, id) {
					if (id === '\0virtualModule') return null;
					if (id === '\0virtualWithExt.js') return null;
					if (id === '\0virtualWithAssetExt.str') return null;
					return (
						'import {virtual} from "\0virtualModule";\nimport {virtual2} from "\0virtualWithExt.js";\nimport {virtual3} from "\0virtualWithAssetExt.str";' +
						code
					);
				}
			}
		]
	}
});
