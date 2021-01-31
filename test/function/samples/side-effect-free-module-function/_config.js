module.exports = {
	description:
		'correctly include functions with side effects from side-effect-free modules (#3942)',
	options: {
		plugins: {
			transform() {
				return { moduleSideEffects: false };
			}
		}
	}
};
