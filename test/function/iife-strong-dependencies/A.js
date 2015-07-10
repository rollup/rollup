import { B } from './B';

export var A = function () {
	this.isA = true;
};

A.prototype = {
	b: function () {
		var Constructor = B;

		return function () {
			return new Constructor();
		};
	}()
};
