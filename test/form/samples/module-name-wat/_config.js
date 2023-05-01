module.exports = defineTest({
	description: 'properly dereferences properties on the global object regardless of nesting',
	options: {
		output: { name: 'foo.@scoped/npm-package.bar.why-would-you-do-this' }
	}
});
