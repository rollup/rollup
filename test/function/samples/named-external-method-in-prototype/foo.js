import { bar } from 'bar';

export default function Foo() {
	this.answer = bar.foobar();
}

Foo.prototype.bar = function () {
	return bar.foobar();
};
