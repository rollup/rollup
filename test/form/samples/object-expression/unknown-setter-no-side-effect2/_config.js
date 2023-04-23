module.exports = defineRollupTest({
	description: 'removes unknown setter access without side effect',
	options: { external: ['external'] }
});
