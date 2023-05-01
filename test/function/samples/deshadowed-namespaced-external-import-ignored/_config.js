module.exports = defineTest({
	description: '#1547',
	options: {
		external: ['external']
	},
	context: {
		require: id => {
			if (id === 'external') return { foo: () => 42 };
			throw new Error('huh?');
		}
	}
});
