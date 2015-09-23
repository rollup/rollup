import { b } from './b';
import z from './z';

z();

const p = {
	q: function () {
		b.nope();
	}
};

(function () {
	const p = {
		q: function () {
			b.nope();
		}
	};
})();

export default 42;
