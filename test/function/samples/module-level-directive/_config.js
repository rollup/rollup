const path = require('path');

module.exports = {
	description: 'module level directives should produce warnings',
	warnings: [
		{
			code: 'MODULE_LEVEL_DIRECTIVE',
			message: "Module level directives cause errors when bundled, 'use asm' was ignored.",
			pos: 0,
			id: path.resolve(__dirname, 'main.js'),
			loc: {
				file: path.resolve(__dirname, 'main.js'),
				line: 1,
				column: 0
			},
			frame: `
			1: "use asm";\n   ^\n2:\n3: export default 1;
			`
		}
	]
};
