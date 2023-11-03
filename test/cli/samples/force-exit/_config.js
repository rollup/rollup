module.exports = defineTest({
	description: 'force exits even with open handles',
	command: 'rollup --config rollup.config.js --forceExit',
	execute: true
});
