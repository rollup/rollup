module.exports = defineTest({
	description: 'checks that entry is resolved',
	options: {
		input: 'not/a/path/that/actually/really/exists'
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Could not resolve entry module "not/a/path/that/actually/really/exists".'
	}
});
