import { C } from './c.js';

export function B () {};

B.prototype = {
	c: function () {
		return function () {
			new C();
		};
	}()
};
