const path = require('path');

module.exports = {
	description: 'entryFileNames pattern supported in combination with preserveModules',
	options: {
		input: 'src/main.ts',
		output: {
			entryFileNames: 'entry-[name]-[format]-[ext][extname][assetExtname].js',
			preserveModules: true
		},
		plugins: [
			{
				name: 'str-plugin',
				transform(code, id) {
					switch (path.extname(id)) {
						case '.str':
							return { code: `export default "${code.trim()}"` };
						default:
							return null;
					}
				}
			}
		]
	}
};
