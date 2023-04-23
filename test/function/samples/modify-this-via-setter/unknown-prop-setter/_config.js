module.exports = defineTest({
	description: 'handles unknown setters that modify "this"',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
