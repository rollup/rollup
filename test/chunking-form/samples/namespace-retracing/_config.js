module.exports = defineRollupTest({
	description: 'internal reexported namespaces over chunk boundaries',
	options: {
		input: ['main-a.js', 'main-b.js']
	}
});
