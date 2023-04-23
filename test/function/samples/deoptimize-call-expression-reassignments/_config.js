module.exports = defineRollupTest({
	description:
		'deoptimizes call expressions of conditional expressions if their return value is reassigned'
});
