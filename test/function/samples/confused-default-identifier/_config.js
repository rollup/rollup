module.exports = defineTest({
	description: 'Rollup should not get confused and allow "default" as an identifier name',
	warnings() {} // suppress
});

// https://github.com/rollup/rollup/issues/215
