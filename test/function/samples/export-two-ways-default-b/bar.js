import { X } from './x.js';

X.prototype.bar = function () {
	this.didBar = true;
	return this;
};
