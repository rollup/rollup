module.exports = defineTest({
	description: 'correctly handles empty external imports in compact mode',
	context: {
		require(id) {
			return { value: id[id.length - 1] };
		}
	},
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			compact: true
		}
	}
});
