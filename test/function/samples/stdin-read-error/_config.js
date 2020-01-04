const { Readable } = require('stream');
const savedStdin = process.stdin;

module.exports = {
	description: 'stdin reads should fail if process.stdin not present (as in a browser)',
	options: {
		input: '-'
	},
	before() {
		delete process.stdin;
		process.stdin = new Readable({
			encoding: 'utf8',
			read() {
				const error = new Error('Stream is broken.');
				return this.destroy ? this.destroy(error) : this.emit('error', error);
			}
		});
	},
	after() {
		process.stdin = savedStdin;
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'load',
		message: 'Could not load -: Stream is broken.',
		plugin: 'Rollup Core',
		watchFiles: ['-']
	}
};
