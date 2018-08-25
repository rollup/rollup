module.exports = {
	description: 'allows plugins to hook render chunk',
	options: {
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
