module.exports = defineTest({
	description: 'serializes quotes, backslashes and line terminators in import attribute values',
	options: {
		external: () => true,
		output: {
			importAttributesKey: 'with'
		}
	}
});
