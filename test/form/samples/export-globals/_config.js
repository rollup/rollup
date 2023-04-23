// Changed due to https://github.com/acornjs/acorn/issues/806
// Consider reverting this change should this become an acorn option

module.exports = defineTest({
	description: 'Supports reexports of globals with namespace access',
	options: {
		output: {
			name: 'myBundle'
		}
	}
});
