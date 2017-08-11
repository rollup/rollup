import Baz from './Baz';
import Foo from './foo';

function Bar () {
	this.inheritsFromBaz = this.isBaz;
}

Bar.prototype = new Baz();

export default function bar() {
  return new Bar();
}
