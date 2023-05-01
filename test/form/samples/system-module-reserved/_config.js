module.exports = defineTest({
	description: 'does not output reserved system format identifiers',
	options: {
		external: ['test'],
		output: {
			name: 'systemReserved',
			globals: { test: 'test' }
		}
	}
});
