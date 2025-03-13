module.exports = defineTest({
	description: 'supports extended custom rendering for dynamic imports',
	options: {
		output: {
			manualChunks(id) {
				if (id.includes('leaf')) return 'leaf';
			}
		},
		external: ['external-module'],
		plugins: {
			name: 'test-plugin',
			renderDynamicImport({ format, chunk, targetChunk, getTargetChunkImports }) {
				const transitiveImports = getTargetChunkImports();
				const resolvedImports = transitiveImports
					? Object.fromEntries(
							getTargetChunkImports().map(chunk => [chunk.fileName, chunk.resolvedImportPath])
						)
					: null;
				return {
					left: `${format}DynamicImportPreload(`,
					right: `, ${JSON.stringify(resolvedImports)}, ${JSON.stringify(chunk?.fileName ?? null)}, ${JSON.stringify(targetChunk?.fileName ?? null)})`
				};
			}
		}
	}
});
