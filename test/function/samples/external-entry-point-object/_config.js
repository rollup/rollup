module.exports = defineTest({
	description: 'throws for entry points that are resolved as an external object by plugins',
	options: {
		plugins: {
			resolveId(id) {
				return { id, external: true };
			}
		}
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Entry module "main.js" cannot be external.'
	}
});
