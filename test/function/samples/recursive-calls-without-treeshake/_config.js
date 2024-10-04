module.exports = defineTest({
	description: 'Avoid maximum call stack error with recursive calls when treeshake is disabled',
	options: {
		treeshake: false
	}
});
