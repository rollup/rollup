module.exports = defineTest({
	description: 'marks the "name" property of emitted assets as deprecated in assetFileNames',
	options: {
		output: {
			assetFileNames(chunkInfo) {
				console.log(chunkInfo.name);
				return '[name][extname]';
			}
		},
		strictDeprecations: true,
		plugins: {
			name: 'test',
			buildStart() {
				this.emitFile({
					type: 'asset',
					name: 'test.txt',
					originalFileName: 'test.txt',
					source: 'test'
				});
			}
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'Accessing the "name" property of emitted assets when generating the file name is deprecated. Use the "names" property instead.',
		url: 'https://rollupjs.org/plugin-development/#generatebundle'
	}
});
