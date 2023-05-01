module.exports = defineTest({
	description: 'supports native esm as well as CJS plugins when using .mjs in Node 13+',
	command: 'rollup -c'
});
