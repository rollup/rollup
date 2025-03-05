module.exports = defineTest({
	description: 'supports custom rendering for dynamic imports',
	options: {
		output: {
			manualChunks(id) {
				if (id.includes('leaf')) return 'leaf';
			}
		},
		plugins: {
			name: 'test-plugin',
			renderDynamicImport({ format }) {
				return {
					renderWithTargetInfo(renderedChunk) {
						return {
							left: `${format}DynamicImportPreload(`,
							right: `, ${JSON.stringify(renderedChunk?.imports ?? null)})`
						};
					}
				};
			}
		}
	}
});
