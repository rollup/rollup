module.exports = defineRollupTest({
	description: 'top-level `this` expression is rewritten as `undefined`',
	options: {
		onwarn: () => {}
	}
});
