module.exports = defineTest({
	description: 'correctly handles empty external imports in compact mode',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			globals: {
				'external-3': 'external3',
				'external-4': 'external4'
			},
			compact: true
		}
	}
});
