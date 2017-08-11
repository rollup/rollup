import { C } from './C';

export var D = function () {
	this.isD = true;
};

D.prototype = {
	c: function () {
		var Constructor = C;

		return function () {
			return new Constructor();
		};
	}()
};
