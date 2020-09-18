'use strict';

var index = require('./custom_modules/@my-scope/my-base-pkg/index.js');

var underBuild = {
	base: index.myBasePkg
};

module.exports = underBuild;
