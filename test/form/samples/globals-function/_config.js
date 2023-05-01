module.exports = defineTest({
	description: 'Externals aliases with deshadowing',
	options: {
		external: ['a', 'b'],
		output: {
			globals: id => `thisIs${id.toUpperCase()}`,
			name: 'myBundle'
		}
	}
});
