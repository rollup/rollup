const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'module level directives should produce warnings',
	warnings: [
		{
			code: 'MODULE_LEVEL_DIRECTIVE',
			id: ID_MAIN,
			message:
				'Module level directives cause errors when bundled, "use asm" in "main.js" was ignored.',
			pos: 0,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 1
			},
			frame: `
				1: "use asm";
				   ^
				2:
				3: export default 1;`
		}
	]
});
