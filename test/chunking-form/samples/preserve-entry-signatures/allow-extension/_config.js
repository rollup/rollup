module.exports = defineTest({
	description: 'Never creates facades for allow-extension',
	options: {
		preserveEntrySignatures: 'allow-extension'
	}
});
