module.exports = defineTest({
	description: 'ignores property read side effects via option',
	options: { treeshake: { propertyReadSideEffects: false } }
});
