module.exports = {
	'.ts': ['eslint --fix --cache'],
	'!(test/**/*).js': ['eslint --fix --cache'],
	'{test/*,test/*/*,test/*/samples/**/_config}.js': ['eslint --fix --cache']
};
