module.exports = defineTest({
	description: 'handles validate failure',
	options: {
		onLog(_level, log) {
			throw log;
		},
		output: {
			outro: '/*',
			validate: true
		}
	},
	generateError: {
		code: 'CHUNK_INVALID',
		message: 'main.js (6:0): Chunk "main.js" is not valid JavaScript: Unterminated block comment.',
		frame: `
4:
5: /*`,
		loc: {
			column: 0,
			file: 'main.js',
			line: 6
		},
		pos: 52
	}
});
