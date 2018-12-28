module.exports = {
	description: 'uses const instead of var if specified (#653)',
	options: {
		output: { name: 'myBundle', preferConst: true }
	}
};
