module.exports = defineTest({
	description: 'supports loading TypeScript config files via plugin option',
	spawnArgs: ['--config', 'rollup.config.ts', '--configPlugin', 'typescript'],
	execute: true
});
