module.exports = defineRollupTest({
	description: 'allows to import ESM dependencies from transpiled config files',
	skipIfWindows: true,
	command: "rollup --config --configPlugin '{transform:c => c}'"
});
