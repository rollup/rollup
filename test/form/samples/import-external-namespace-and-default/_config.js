module.exports = defineTest({
	description: 'disinguishes between external default and namespace (#637)',
	options: {
		external: ['foo'],
		output: {
			globals: { foo: 'foo' }
		}
	}
});
