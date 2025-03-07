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
			renderDynamicImport({ format, getTargetChunkImports }) {
				const transitiveImports = getTargetChunkImports();
				const resolvedImports = transitiveImports
					? Object.fromEntries(
							getTargetChunkImports().map(chunk => [
								chunk.type === 'internal' ? chunk.chunk.preliminaryFilename : chunk.filename,
								chunk.resolvedImportPath
							])
						)
					: null;
				return {
					left: `${format}DynamicImportPreload(`,
					right: `, ${JSON.stringify(resolvedImports)})`
				};
			}
		}
	}
});
