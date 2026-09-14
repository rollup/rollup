module.exports = defineTest({
	description: 'escapes quotes and backslashes in import attribute values',
	options: {
		external: () => true,
		output: {
			importAttributesKey: 'with'
		}
	}
});
