module.exports = defineRollupTest({
	description: 'Externals aliases with deshadowing',
	options: {
		external: ['a', 'b'],
		output: {
			globals: { a: 'a', b: 'b' },
			name: 'myBundle'
		}
	}
});
