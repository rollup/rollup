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
			generateBundle() {
				this.emitFile({
					type: 'asset',
					fileName: 'large.txt',
					source: new Uint8Array(2 ** 20).fill(120)
				});
			}
		}
	]
};
