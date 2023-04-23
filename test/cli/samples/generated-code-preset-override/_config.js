module.exports = defineTest({
	description: 'overrides the generatedCode option when using presets',
	command: 'rollup --config --generatedCode es5 --generatedCode.arrowFunctions'
});
