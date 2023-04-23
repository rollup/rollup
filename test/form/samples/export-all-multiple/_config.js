module.exports = defineTest({
	description: 'correctly handles multiple export * declarations (#1252)',
	options: {
		external: ['foo', 'bar', 'baz'],
		output: {
			globals: { foo: 'foo', bar: 'bar', baz: 'baz' },
			name: 'myBundle'
		}
	}
});
