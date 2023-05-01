const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'use CLI --validate to test whether output is well formed',
	skipIfWindows: true,
	command: `rollup main.js --silent --outro 'console.log("end"); /*' -o _actual/out.js --validate`,
	error: () => true,
	stderr: stderr =>
		assertIncludes(
			stderr,
			`(!) Chunk "out.js" is not valid JavaScript: Unterminated comment (3:20).
out.js (3:20)
1: console.log(2 );
2: 
3: console.log("end"); /*
                       ^`
		)
});
