import { D } from './D';

export var C = function () {
	this.isC = true;
};

C.prototype = {
	d: function () {
		return new D();
	}
};
