module.exports = {
	options: {
		input: 'main.js',
		plugins: [
			{
				generateBundle() {
					this.emitFile({ type: 'asset', fileName: 'myfile', source: 'abc' });
				}
			}
		]
	}
};
