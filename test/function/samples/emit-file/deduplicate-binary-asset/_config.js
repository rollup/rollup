const source = Buffer.from('abc');

module.exports = {
	description: 'warns if multiple files with the same name are emitted',
	options: {
		input: 'main.js',
		plugins: [
			{
				buildStart() {
					this.emitFile({ type: 'asset', name: 'buildStart', source });
				},
				generateBundle() {
					this.emitFile({ type: 'asset', name: 'generateBundle', source });
				}
			}
		]
	}
};
