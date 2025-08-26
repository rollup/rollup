module.exports = defineTest({
	description:
		'supports loading TypeScript config files referencing workspace projects via plugin option',
	spawnArgs: ['--config', 'rollup.config.ts', '--configPlugin', 'typescript'],
	execute: false
});
