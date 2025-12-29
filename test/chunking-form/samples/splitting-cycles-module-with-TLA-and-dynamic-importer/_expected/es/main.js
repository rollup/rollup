import { A } from './generated-a.js';
import Foo from './generated-foo.js';

class Bar extends A {
  bar() {
    return new Foo().foo();
  }
}

new Bar().bar();
