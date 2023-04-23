module.exports = defineTest({
	description: 'throws when an nested property of an unknown object property is accessed',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	}
});
