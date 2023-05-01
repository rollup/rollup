module.exports = defineTest({
	description: 'correctly handles empty external imports in compact mode',
	options: {
		external: ['external'],
		output: {
			compact: true
		}
	}
});
