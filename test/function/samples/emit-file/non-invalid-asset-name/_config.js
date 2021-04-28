module.exports = {
	description: 'throws for invalid asset names with special characters',
	options: {
		plugins: {
			name: 'test-plugin',
			buildStart() {
				this.emitFile({ type: 'asset', name: '\0test.ext', source: 'content' });
			}
		}
	}
};
