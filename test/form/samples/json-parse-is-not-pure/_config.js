module.exports = defineTest({
	description: 'JSON.parse is not pure as it can throw on invalid json strings',
	options: { output: { name: 'myBundle' } }
});
