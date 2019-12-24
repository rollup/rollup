module.exports = {
	description: 'breaks control flow when an error is thrown inside a catch block',
	options: {
		treeshake: { tryCatchDeoptimization: false }
	}
};
