module.exports = defineTest({
	description:
		'renders exported destructuring declarations as plain bindings and keeps reassigned exports live',
	options: { output: { format: 'cjs' } }
});
