module.exports = {
	description: 'inserts necessary white-space when simplifying if-statements (#3419)',
	options: {
		external: 'external'
	},
	context: {
		require() {
			return false;
		}
	}
};
