module.exports = {
	description:
		'supports returning undefined source maps from render chunk hooks, when source maps are enabled',
	options: {
		output: {
			sourcemap: true
		},
		plugins: [
			{
				renderChunk(code) {
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
};
