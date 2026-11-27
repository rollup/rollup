module.exports = {
	input: 'virtual',
	output: { format: 'es' },
	plugins: [
		{
			name: 'large-output',
			buildStart() {
				setInterval(() => {}, 2 ** 24);
			},
			resolveId() {
				return 'virtual';
			},
			load() {
				return 'console.log(1);';
			},
			renderChunk() {
				return `console.log(${JSON.stringify('x'.repeat(2 ** 20))});\n`;
			}
		}
	]
};
