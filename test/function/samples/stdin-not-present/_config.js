const savedStdin = process.stdin;

module.exports = {
	description: 'stdin reads should fail if process.stdin not present (as in a browser)',
	options: {
		input: '-'
	},
	before() {
		delete process.stdin;
	},
	after() {
		process.stdin = savedStdin;
	},
	error: {
		// TODO we probably want a better error code here as this one is confusing
		code: 'PLUGIN_ERROR',
		hook: 'load',
		// TODO the error message does not need to refer to browsers as there are other possible scenarios
		message: 'Could not load -: stdin input is invalid in browser',
		plugin: 'Rollup Core',
		watchFiles: ['-']
	}
};
