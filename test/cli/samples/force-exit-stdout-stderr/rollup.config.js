module.exports = {
	input: 'virtual',
	output: { format: 'es' },
	plugins: [
		{
			name: 'large-warning',
			buildStart() {
				setInterval(() => {}, 2 ** 24);
				this.warn('warning-start' + 'x'.repeat(2 ** 20) + 'warning-end');
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
