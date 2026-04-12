module.exports = defineTest({
	description:
		'do not catch else branches from parent if statements when simplifying if-statements',
	context: {
		unknown: true
	}
});
