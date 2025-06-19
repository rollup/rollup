module.exports = defineTest({
	description: 'allows to import ESM dependencies from transpiled config files',
	skipIfWindows: true,
	spawnArgs: ['--config', '--configPlugin', '{transform:c => c}']
});
