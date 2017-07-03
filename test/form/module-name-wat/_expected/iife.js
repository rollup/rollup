this.foo = this.foo || {};
this.foo['@scoped/npm-package'] = this.foo['@scoped/npm-package'] || {};
this.foo['@scoped/npm-package'].bar = this.foo['@scoped/npm-package'].bar || {};
this.foo['@scoped/npm-package'].bar['why-would-you-do-this'] = (function (exports) {
	'use strict';

	let foo = 'foo';

	exports.foo = foo;

}({}));
