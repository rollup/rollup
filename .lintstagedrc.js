module.exports = {
	'*.md': ['prettier --write'],
	'*.{ts,js}': ['eslint --fix --cache']
};
