module.exports = defineTest({
	description:
		'break statements should always by included but not always cause their parents to have effects',
	options: { output: { name: 'myBundle' } }
});
