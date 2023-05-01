module.exports = defineTest({
	description: 'supports emitting an asset without a name',
	options: {
		input: ['main.js'],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'asset', source: 'hello world' });
			}
		}
	}
});
