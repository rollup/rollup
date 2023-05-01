module.exports = defineTest({
	description: 'Properly handle adding a default reexport to a namespace (#3583)',
	options: {
		input: ['main.js', 'icons/one.js']
	}
});
