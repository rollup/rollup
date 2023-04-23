module.exports = defineTest({
	description:
		'correctly imports dynamic namespaces with only a default export from entry- and non-entry-point chunks',
	options: {
		input: ['main', 'entry']
	}
});
