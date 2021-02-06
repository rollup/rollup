const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'use CLI --validate to test whether output is well formed',
	skipIfWindows: true,
	command: `rollup main.js --silent --outro 'console.log("end"); /*' -o _actual/out.js --validate`,
	error(err) {
		assertIncludes(err.message, `validate failed for output 'out.js'`);
		assertIncludes(err.message, 'SyntaxError: Unterminated comment (3:20)');
	}
};
