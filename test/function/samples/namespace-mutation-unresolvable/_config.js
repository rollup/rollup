module.exports = defineTest({
	description: 'detects mutations of unresolvable namespace members',
	exports({ test }) {
		test(['value', 'value2']);
	}
});
