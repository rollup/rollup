module.exports = defineRollupTest({
	description: 'prevent conflicts with cjs module globals',
	options: {
		output: { name: 'bundle' }
	}
});
