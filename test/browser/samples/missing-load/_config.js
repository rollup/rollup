module.exports = defineTest({
	description: 'fails if a file cannot be loaded',
	options: {
		plugins: {
			name: 'test',
			resolveId(source) {
				return source;
			}
		}
	},
	error: {
		code: 'NO_FS_IN_BROWSER',
		message:
			'Could not load main: Cannot access the file system (via "fs.readFile") when using the browser build of Rollup. Make sure you supply a plugin with custom resolveId and load hooks to Rollup.',
		url: 'https://rollupjs.org/plugin-development/#a-simple-example',
		watchFiles: ['main']
	}
});
