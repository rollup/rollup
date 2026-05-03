module.exports = defineTest({
	description:
		'does not rename a nested function parameter named "exports" when the scope does not need the output "exports" identifier (https://github.com/rollup/rollup/issues/6357)',
	options: { output: { name: 'bundle' } },
	expectedWarnings: ['EVAL']
});
