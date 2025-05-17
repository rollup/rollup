module.exports = defineTest({
	description: 'does not transpile cjs configs and provides correct __filename',
	spawnArgs: ['-c']
});
