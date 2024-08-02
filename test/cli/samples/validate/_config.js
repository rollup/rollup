const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'use CLI --validate to test whether output is well formed',
	skipIfWindows: true,
	command: `rollup main.js --outro 'console.log("end"); /*' -o _actual/out.js --validate`,
	error: () => true,
	stderr: stderr =>
		assertIncludes(
			stderr,
			`(!) out.js (4:0): Chunk "out.js" is not valid JavaScript: Unterminated block comment.
out.js:4:0
2: 
3: console.log("end"); /*`
		)
});
