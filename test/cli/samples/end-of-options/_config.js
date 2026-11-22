module.exports = defineTest({
	description: 'treats a long option and bare dash after -- as positional inputs',
	spawnArgs: ['--no-stdin', '--dir', '_actual', '--', '--input', '-']
});
