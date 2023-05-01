module.exports = defineTest({
	description: 'verify property accesses are retained for getters with side effects',
	command: `rollup main.js --validate --treeshake.propertyReadSideEffects=always`
});
