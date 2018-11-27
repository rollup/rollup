module.exports = {
	description: 'makes sure dynamic chunks are not tainted',
	options: {
		input: ['main1.js', 'main2.js']
	}
};
// TODO Lukas also test this has the right bundle information
