module.exports = defineTest({
	description: 'allows adding modules already in the graph as entry points',
	options: {
		input: {
			'first-main': 'main1',
			'second-main': 'main2'
		},
		plugins: {
			buildStart() {
				// it should be possible to add existing entry points while not overriding their alias
				this.emitFile({ type: 'chunk', id: 'main1' });

				// if an existing dependency is added, all references should use the new name
				this.emitFile({ type: 'chunk', id: 'dep.js' });
				this.emitFile({ type: 'chunk', id: 'dep' });
			}
		}
	}
});
