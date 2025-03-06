module.exports = defineTest({
	description: 'supports extended custom rendering for dynamic imports',
	options: {
		output: {
			manualChunks(id) {
				if (id.includes('leaf')) return 'leaf';
			}
		},
		plugins: {
			name: 'test-plugin',
			renderDynamicImport({ format }) {
				return targetInfo => ({
					left: `${format}DynamicImportPreload(`,
					right: `, ${JSON.stringify(targetInfo?.resolvedImports ?? null)})`
				});
			}
		}
	}
});
