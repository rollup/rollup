module.exports = defineTest({
	description: 'extends namespaced module name',
	options: {
		output: {
			extend: true,
			name: 'foo.bar.baz'
		}
	}
});
