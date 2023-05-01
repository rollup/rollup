module.exports = defineTest({
	description: 'excludes functions that are known to be pure',
	options: { output: { name: 'myBundle' } }
});
