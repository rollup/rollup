export function X () {}

X.prototype.foo = function () {
	this.didFoo = true;
	return this;
};

export default X;
