module.exports = defineRollupTest({
	description: 'removes unknown getter access without side effect',
	options: { external: ['external'] }
});
