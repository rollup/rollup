module.exports = defineTest({
	description: 'index key',
	options: {
		external: ['x'],
		output: {
			globals: {
				x: 'x'
			}
		}
	}
});
