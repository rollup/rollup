module.exports = defineTest({
	description: 'allow globals to be exported and imported',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: { output: { name: 'doc' } }
});
