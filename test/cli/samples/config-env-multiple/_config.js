module.exports = defineTest({
	description: 'passes environment variables to config file via multiple --environment values',
	spawnArgs: [
		'--config',
		'--environment',
		'PRODUCTION,FOO:bar',
		'--environment',
		'SECOND,KEY:value',
		'--environment',
		'FOO:foo'
	],
	execute: true
});
