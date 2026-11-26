module.exports = {
	input: 'virtual',
	output: { format: 'es', file: '_actual/bundle.js' },
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
			}
		}
	]
};
