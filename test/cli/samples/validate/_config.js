const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'use CLI --validate to test whether output is well formed',
	command: `rollup main.js --silent --outro 'console.log("end"); /*' -o _actual/out.js --validate`,
	error: () => true,
	stderr: stderr =>
		assertIncludes(
			stderr,
			`[!] Error: Chunk "out.js" is not valid JavaScript: Unterminated comment (3:20).
out.js (3:20)
1: console.log(2 );
2: 
3: console.log("end"); /*
                       ^`
		)
};
