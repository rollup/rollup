module.exports = defineTest({
	description: 'supports modify the import attributes key in the config file',
	spawnArgs: [
		'--config',
		'rollup.config.ts',
		'--configPlugin',
		'typescript',
		'--configImportAttributesKey',
		'with'
	],
	minNodeVersion: 22
});
