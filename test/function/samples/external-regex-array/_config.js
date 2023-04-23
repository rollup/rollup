module.exports = defineTest({
	description: 'allows external option to be an array of regex and strings',
	options: {
		external: [/external/, 'other']
	},
	context: {
		require: id => {
			if (id === 'external') return 42;
			if (id === 'other') return 17;
			return require(id);
		}
	}
});
