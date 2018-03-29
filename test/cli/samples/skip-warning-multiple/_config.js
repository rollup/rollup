module.exports = {
	description: 'ignores warnings by code',
	command: 'rollup --config rollup.config.js --format es --skipWarning CIRCULAR_DEPENDENCY -s UNRESOLVED_IMPORT'
};
