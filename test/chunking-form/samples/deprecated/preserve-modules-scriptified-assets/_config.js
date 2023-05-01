const path = require('node:path');

module.exports = defineTest({
	description: 'scriptified assets have extension in preserveModules output filename',
	options: {
		strictDeprecations: false,
		input: 'src/main.js',
		preserveModules: true,
		plugins: [
			{
				name: 'str-num-plugin',
				transform(code, id) {
					switch (path.extname(id)) {
						case '.num': {
							return { code: `export default ${code.trim()}` };
						}
						case '.str': {
							return { code: `export default "${code.trim()}"` };
						}
						case '': {
							return { code: 'export default "COULDN\'T TRANSFORM"' };
						}
						default: {
							return null;
						}
					}
				}
			}
		]
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
