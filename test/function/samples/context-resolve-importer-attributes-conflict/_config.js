module.exports = defineTest({
	description: 'rejects importerAttributes when this.resolve receives an object importer',
	options: {
		plugins: {
			name: 'test',
			buildStart() {
				return this.resolve(
					'target',
					{ attributes: { type: 'object' }, rawId: 'importer' },
					{ importerAttributes: { type: 'option' } }
				);
			}
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message:
			'[plugin test] The "importerAttributes" option cannot be used together with an object importer in this.resolve().',
		plugin: 'test'
	}
});
