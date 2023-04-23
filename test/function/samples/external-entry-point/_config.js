module.exports = defineTest({
	description: 'throws for entry points that are resolved as false by plugins',
	options: {
		plugins: {
			resolveId() {
				return false;
			}
		}
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Entry module "main.js" cannot be external.'
	}
});
