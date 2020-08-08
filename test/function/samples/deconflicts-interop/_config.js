module.exports = {
	description: 'deconflicts the interop function',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			interop(id) {
				switch (id) {
					case 'external1':
						return true;
					case 'external2':
					case 'external3':
						return 'auto';
					case 'external4':
						return 'default';
					case 'external5':
						return 'defaultOnly';
					default:
						throw new Error(`Unexpected require "${id}"`);
				}
			}
		}
	},
	context: {
		require: id => {
			return Object.defineProperty({ foo: 'foo', default: 'bar' }, '__esModule', { value: true });
		}
	}
};
