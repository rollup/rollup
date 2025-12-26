import A from "./a.js"
import Foo from "./foo.js"

class Bar extends A {
  bar() {
    return new Foo().foo();
  }
}

new Bar().bar();
