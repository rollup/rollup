import { D } from './d.js';

export function C () {
	this.x = 'x';
}

C.prototype = {
	d: function () {
		return function () {
			new D();
		};
	}()
};
