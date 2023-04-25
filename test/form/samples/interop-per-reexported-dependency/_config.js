module.exports = defineTest({
	description: 'allows to configure the interop type per reexported external dependency',
	options: {
		external: id => id.startsWith('external'),
		output: {
			/** @type any */
			interop(id) {
				return id.split('-')[1];
			},
			globals(id) {
				return id.replace('-', '');
			},
			name: 'bundle'
		}
	}
});
