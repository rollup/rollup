module.exports = defineTest({
	description: 'warns if multiple files with the same name are emitted',
	options: {
		input: 'main.js',
		plugins: [
			{
				buildStart() {
					this.emitFile({ type: 'asset', fileName: 'buildStart', source: 'abc' });
				},
				generateBundle() {
					this.emitFile({ type: 'asset', fileName: 'buildStart', source: 'abc' });
					this.emitFile({ type: 'asset', fileName: 'generateBundle', source: 'abc' });
					this.emitFile({ type: 'asset', fileName: 'generateBundle', source: 'abc' });
				}
			}
		]
	},
	warnings: [
		{
			code: 'FILE_NAME_CONFLICT',
			message:
				'The emitted file "buildStart" overwrites a previously emitted file of the same name.'
		},
		{
			code: 'FILE_NAME_CONFLICT',
			message:
				'The emitted file "generateBundle" overwrites a previously emitted file of the same name.'
		}
	]
});
