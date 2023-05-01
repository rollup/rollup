module.exports = defineTest({
	description: 'excludes constructors that are known to be pure',
	options: { output: { name: 'myBundle' } }
});
