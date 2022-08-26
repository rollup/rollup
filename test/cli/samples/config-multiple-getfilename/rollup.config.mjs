let fileReference;

export default {
	input: 'main.js',
	plugins: {
		name: 'test',
		buildStart() {
			fileReference = this.emitFile({ type: 'chunk', id: 'main.js' });
		},
		generateBundle(options) {
			this.emitFile({
				type: 'asset',
				fileName: `${options.format}.txt`,
				source: this.getFileName(fileReference)
			});
		}
	},
	output: [
		{
			format: 'es',
			dir: '_actual',
			entryFileNames: 'es-[name].js'
		},
		{
			format: 'cjs',
			dir: '_actual',
			entryFileNames: 'cjs-[name].js',
			exports: 'auto'
		}
	]
};
