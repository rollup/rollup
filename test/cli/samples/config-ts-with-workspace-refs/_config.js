module.exports = defineTest({
	description: 'supports loading TypeScript config files referencing workspace projects',
	spawnArgs: ['--config', 'rollup.config.ts', '--configPlugin', 'typescript'],
	execute: false
});
