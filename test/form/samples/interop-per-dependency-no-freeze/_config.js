module.exports = {
	description: 'respects the freeze option',
	options: {
		external: id => id.startsWith('external'),
		output: {
			freeze: false,
			interop(id) {
				return id.split('-')[1];
			},
			globals(id) {
				return id.replace('-', '');
			}
		}
	}
};
