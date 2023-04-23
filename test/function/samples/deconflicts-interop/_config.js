module.exports = defineTest({
	description: 'deconflicts the interop function',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			interop(id) {
				switch (id) {
					case 'external1':
					case 'external2': {
						return 'auto';
					}
					case 'external3': {
						return 'default';
					}
					case 'external4': {
						return 'defaultOnly';
					}
					default: {
						throw new Error(`Unexpected require "${id}"`);
					}
				}
			}
		}
	},
	context: {
		require: () =>
			Object.defineProperty({ foo: 'foo', default: 'bar' }, '__esModule', { value: true })
	}
});
