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
		message: 'Chunk "main.js" is not valid JavaScript: Unterminated block comment.',
		frame: `
3: throw new Error('Not executed');
4:
5: /*
   ^`,
		loc: {
			column: 0,
			file: 'main.js',
			line: 5
		},
		pos: 49
	}
});
