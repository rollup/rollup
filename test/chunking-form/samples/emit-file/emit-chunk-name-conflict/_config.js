module.exports = defineTest({
	description: 'deduplicates named chunks emitted more than once',
	options: {
		// For the second entry, a facade is created
		input: { mainChunk: 'main', other: 'main' },
		plugins: {
			buildStart() {
				// The chunk is only emitted once
				this.emitFile({ type: 'chunk', id: 'dep1', name: 'name' });
				this.emitFile({ type: 'chunk', id: 'dep1', name: 'name' });

				// One of the suggested names is picked
				this.emitFile({ type: 'chunk', id: 'dep2', name: 'firstName' });
				this.emitFile({ type: 'chunk', id: 'dep2', name: 'secondName' });

				// Chunks with the same name are deduplicated
				this.emitFile({ type: 'chunk', id: 'dep3', name: 'name' });

				// Names for user defined chunks are not overridden
				this.emitFile({ type: 'chunk', id: 'main', name: 'ignored' });
			},
			load(id) {
				if (id.endsWith('main.js')) {
					this.emitFile({ type: 'chunk', id: 'dep1', name: 'name' });
					this.emitFile({ type: 'chunk', id: 'dep2', name: 'thirdName' });
					this.emitFile({ type: 'chunk', id: 'main', name: 'ignored' });
				}
			}
		}
	}
});
