module.exports = defineTest({
	description:
		'correctly drop side-effect free statements in presence of update expression (#1564)',
	expectedWarnings: ['EMPTY_BUNDLE']
});
