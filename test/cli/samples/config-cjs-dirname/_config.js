module.exports = defineRollupTest({
	description: 'does not transpile cjs configs and provides correct __filename',
	command: 'rollup -c'
});
