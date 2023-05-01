module.exports = defineTest({
	description: 'supports loading TypeScript config files via plugin option',
	command: 'rollup --config rollup.config.ts --configPlugin typescript',
	execute: true
});
