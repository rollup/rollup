module.exports = defineTest({
	description:
		'Does not wrongly attribute side effects when the super class of an unused class is in a file without side effects (#4808)',
	options: { treeshake: { moduleSideEffects: false } }
});
