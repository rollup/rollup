import { b } from './b';
import z from './z';

z();

var p = {
	q: function () {
		b.nope();
	}
};

(function () {
	var p = {
		q: function () {
			b.nope();
		}
	};
})();

export default 42;
