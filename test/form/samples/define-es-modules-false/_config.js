module.exports = {
  solo: true,
	description: 'Not add __esModule property to exports with esModule: false',
	options: {
		output: { name: 'foo', esModule: false },
	}
};
