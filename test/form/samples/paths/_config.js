module.exports = defineTest({
	description: 'external paths (#754)',
	options: {
		external: ['foo'],
		output: {
			globals: { foo: 'foo' },
			paths: { foo: 'https://unpkg.com/foo' }
		}
	}
});
