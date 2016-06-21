import { X } from './x.js'; // import X works

X.prototype.bar = function () {
	console.log( 'bar' );
	return this;
};
