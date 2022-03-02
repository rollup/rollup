module.exports = {
	description: 'namespace export should have @@toStringTag with correct property descriptors #4336',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	}
};
