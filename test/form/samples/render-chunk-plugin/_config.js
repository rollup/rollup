module.exports = defineTest({
	description: 'allows plugins to hook render chunk',
	options: {
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
