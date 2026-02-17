module.exports = defineTest({
	description: 'parseAndWalk should throw error when specifying invalid node visitor name',
	walk: {
		InvalidNodeType() {
			// Should not reach here
		}
	},
	error: {
		message: 'Unknown node type "InvalidNodeType" when calling "parseAndWalk".'
	}
});
