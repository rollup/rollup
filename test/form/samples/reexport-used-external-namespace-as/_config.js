module.exports = {
	description: 'reexport external namespace as name if the namespace is also used',
	options: {
		external: ['external1', 'external2'],
		output: {
			name: 'bundle',
			globals: {
				external1: 'external1',
				external2: 'external2'
			}
		}
	}
};
