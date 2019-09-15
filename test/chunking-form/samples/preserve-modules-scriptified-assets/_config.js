const path = require('path');

module.exports = {
	description: 'scriptified assets have extension in preserveModules output filename',
	options: {
		input: 'src/main.js',
		preserveModules: true,
		plugins: [
			{
				name: 'str-num-plugin',
				transform(code, id) {
					switch (path.extname(id)) {
						case '.num':
							return { code: `export default ${code.trim()}` };
						case '.str':
							return { code: `export default "${code.trim()}"` };
						case '':
							return { code: 'export default "COULDN\'T TRANSFORM"' };
						default:
							return null;
					}
				}
			}
		]
	}
};
