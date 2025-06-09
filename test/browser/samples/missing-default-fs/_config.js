module.exports = defineTest({
	description: 'fails when accessing fs from a browser without supplying it via option',
	options: {
		plugins: {
			name: 'test',
			resolveId(source) {
				return source;
			},
			load(id) {
				return this.fs.readFile(id, { encoding: 'utf8' });
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'load',
		message:
			'Could not load main: Cannot access the file system (via "fs.readFile") when using the browser build of Rollup. Make sure you supply a plugin with custom resolveId and load hooks to Rollup.',
		plugin: 'test',
		pluginCode: 'NO_FS_IN_BROWSER',
		url: 'https://rollupjs.org/plugin-development/#a-simple-example'
	}
});
