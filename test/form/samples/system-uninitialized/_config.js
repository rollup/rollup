// Changed due to https://github.com/acornjs/acorn/issues/806
// Consider reverting this change should this become an acorn option

module.exports = defineTest({
	description: 'supports uninitialized binding exports',
	options: {
		output: {
			format: 'system'
		}
	}
});
