export default {
	input: 'main.js',
	output: {
		format: 'es',
		preserveModules: true
	},
	plugins: [
		{
			resolveId(id) {
				if (id.endsWith('sub.js')) {
					return id;
				}
			},
			load(id) {
				if (id.endsWith('sub.js')) {
					return 'export default "sub.js url"';
				}
			}
		}
	]
};
