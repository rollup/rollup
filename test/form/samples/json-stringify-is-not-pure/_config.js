module.exports = defineTest({
	description: 'JSON.stringify is not pure as it can throw on circular structures',
	options: { output: { name: 'myBundle' } }
});
