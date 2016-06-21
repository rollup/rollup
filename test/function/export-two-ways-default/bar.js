import { X } from './x.js'; // import X works

X.prototype.bar = function () {
	this.didBar = true;
	return this;
};
