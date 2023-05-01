module.exports = defineTest({
	description: 'Does not include entry exports and does not preserve the signature',
	options: {
		preserveEntrySignatures: false
	}
});
