module.exports = defineRollupTest({
	description: 'properly inserts semi-colons after declarations (#1993)',
	options: { output: { name: 'bundle' } }
});
