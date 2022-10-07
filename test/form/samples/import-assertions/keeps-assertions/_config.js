module.exports = {
	description: 'keeps any import assertions on input',
	options: {
		external: () => true,
		output: { name: 'bundle' }
	}
};
