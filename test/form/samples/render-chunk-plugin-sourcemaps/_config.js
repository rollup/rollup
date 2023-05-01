module.exports = defineTest({
	description:
		'supports returning undefined source maps from render chunk hooks, when source maps are enabled',
	expectedWarnings: ['SOURCEMAP_BROKEN'],
	options: {
		output: {
			sourcemap: true
		},
		plugins: [
			{
				renderChunk() {
					return '/* first plugin */';
				}
			},
			{
				renderChunk(code) {
					return code + '\n/* second plugin */';
				}
			}
		]
	}
});
