module.exports = {
	description: 'correctly handles empty external imports in compact mode',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			compact: true
		}
	}
};
