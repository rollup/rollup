// Changed due to https://github.com/acornjs/acorn/issues/806
// Consider reverting this change should this become an acorn option

module.exports = {
	description: 'allow globals to be exported and imported',
	options: { output: { name: 'doc' } }
};
