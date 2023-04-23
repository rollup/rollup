module.exports = defineRollupTest({
	description: 'only deconflict "exports" for formats where it is necessary',
	options: { output: { name: 'bundle' } }
});
