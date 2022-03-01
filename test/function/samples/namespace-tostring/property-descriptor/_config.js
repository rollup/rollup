module.exports = {
	description: 'namespace export should have @@toStringTag with correct property descriptors #4336',
	options: {
		output: {
			generatedCode: { symbols: true }
		}
	}
};
