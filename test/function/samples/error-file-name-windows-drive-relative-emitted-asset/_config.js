module.exports = defineTest({
	description: 'throws when a plugin emits an asset with a Windows drive-relative file name',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({
						type: 'asset',
						fileName: 'C:../evil-asset.txt',
						source: 'injected'
					});
				}
			}
		]
	},
	generateError: {
		code: 'FILE_NAME_OUTSIDE_OUTPUT_DIRECTORY',
		message:
			'The output file name "C:../evil-asset.txt" is not contained in the output directory. Make sure all file names are relative paths without ".." segments.'
	}
});
