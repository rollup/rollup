module.exports = {
	description:
		'does not throw an error if multiple files with the same name are emitted (until #3174 is fixed)',
	options: {
		input: 'main.js',
		plugins: [
			{
				generateBundle() {
					this.emitFile({ type: 'asset', fileName: 'myfile', source: 'abc' });
					this.emitFile({ type: 'asset', fileName: 'myfile', source: 'abc' });
				}
			}
		]
	}
};
