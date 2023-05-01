module.exports = defineTest({
	description: 'correctly simplifies assignments with right-hand-sides in parentheses (#3924)',
	context: {
		someObject: { isTrue: true }
	}
});
