import { A } from './A';

export var B = function () {
	this.isB = true;
};

B.prototype = {
	a: function () {
		return new A();
	}
};
