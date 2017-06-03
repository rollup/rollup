import * as Bob from "./bob";
import * as Alice from "./alice";

function g() {
  var foo = Bob.foo();
  return foo;
}

function f() {
  var foo = Alice.foo();
  return foo;
}

assert.equal(f(), "alice");
assert.equal(g(), "bob");



