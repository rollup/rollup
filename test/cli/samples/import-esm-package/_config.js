module.exports = {
	description: 'allows to import ESM dependencies from transpiled config files',
	command: "rollup --config --configPlugin '{transform: c => c}'"
};
