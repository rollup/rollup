import { B } from './b.js';
import { C } from './c.js';

export function D () {};

D.prototype = {
	c: function () {
		return function () {
			new C();
		};
	}()
};
