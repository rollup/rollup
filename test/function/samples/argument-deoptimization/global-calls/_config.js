module.exports = defineTest({
	description: 'tracks argument mutations of calls to globals',
	options: {
		treeshake: {
			tryCatchDeoptimization: false
		}
	}
});
