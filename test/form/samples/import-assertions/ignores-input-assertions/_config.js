module.exports = {
	solo: true,
	description: 'ignores any import assertions on input',
	options: {
		external: () => true,
		output: { name: 'bundle' }
	}
};
