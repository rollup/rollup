module.exports = defineTest({
	description: 'detects side-effects when setting and/or calling properties on object literals',
	options: { output: { name: 'bundle' } }
});
