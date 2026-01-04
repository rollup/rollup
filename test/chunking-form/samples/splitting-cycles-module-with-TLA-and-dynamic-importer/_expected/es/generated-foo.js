import { A } from './generated-a.js';

class Foo extends A {
  foo() { console.log("hello"); }
}

export { Foo as default };
