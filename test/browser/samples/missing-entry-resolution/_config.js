module.exports = defineTest({
	description: 'fails if an entry cannot be resolved',
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Could not resolve entry module "main".'
	}
});
