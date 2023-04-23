module.exports = defineRollupTest({
	description: 'correctly resolves namespace members when accessed early (#2895)',
	options: { external: 'external' }
});
