const assert = require('assert');

module.exports = {
	description: 'associates redeclared parameters (#2451)',
	exports(exported) {
		assert.equal(exported.fnDecl(true), 1, 'function declaration');
		assert.equal(exported.fnExp(true), 1, 'function expression');
		assert.equal(exported.arrowFn(true), 1, 'arrow function');
	}
};
