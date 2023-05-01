module.exports = defineTest({
	description: 'prevent conflicts with cjs module globals',
	options: {
		output: { name: 'bundle' }
	}
});
