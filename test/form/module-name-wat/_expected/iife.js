this.foo = this.foo || {};
this.foo['@scoped/npm-package'] = this.foo['@scoped/npm-package'] || {};
this.foo['@scoped/npm-package'].bar = this.foo['@scoped/npm-package'].bar || {};
(function (exports) {
	'use strict';

	let foo = 'foo';

	exports.foo = foo;

}((this.foo['@scoped/npm-package'].bar['why-would-you-do-this'] = this.foo['@scoped/npm-package'].bar['why-would-you-do-this'] || {})));
