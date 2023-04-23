module.exports = defineTest({
	description: 'Generates actual files for virtual modules when preserving modules',
	options: {
		input: 'main.js',
		output: { preserveModules: true },
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
	}
});
