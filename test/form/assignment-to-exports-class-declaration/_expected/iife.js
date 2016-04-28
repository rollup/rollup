(function (exports) {
	'use strict';

	exports.Foo = class Foo {}
	exports.Foo = lol( exports.Foo );

}((this.myModule = this.myModule || {})));
