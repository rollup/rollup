module.exports = defineTest({
	description:
		'Observes side-effects in side-effect-free modules that contain a used default export that just reexports from another module',
	options: {
		treeshake: { moduleSideEffects: false }
	}
});
