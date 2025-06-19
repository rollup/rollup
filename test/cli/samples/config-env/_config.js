module.exports = defineTest({
	description: 'passes environment variables to config file',
	spawnArgs: ['--config', '--environment', 'PRODUCTION,FOO:bar,HOST:http://localhost:4000'],
	execute: true
});
