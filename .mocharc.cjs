module.exports = {
	reporter: process.env.GITHUB_ACTIONS ? 'github-actions' : 'spec'
};
