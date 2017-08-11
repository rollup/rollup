module.exports = {
	description: 'correctly handles multiple export * declarations (#1252)',
	options: {
		external: [ 'foo', 'bar', 'baz' ],
		globals: { foo: 'foo', bar: 'bar', baz: 'baz' },
		moduleName: 'myBundle'
	}
};
