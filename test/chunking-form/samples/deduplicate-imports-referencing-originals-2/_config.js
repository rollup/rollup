module.exports = {
	// solo: true, // BROKEN
	description:
		'do not import variables that reference an original if another variable referencing it is already imported',
	options: {
		input: ['main1', 'main2']
	}
};
