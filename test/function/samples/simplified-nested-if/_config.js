module.exports = defineRollupTest({
	description:
		'do not catch else branches from parent if statements when simplifiying if-statements',
	context: {
		unknown: true
	}
});
