console.log("esm-test: node_modules/print/index.js");

console.log("esm-test: node_modules/foo/index.js");

var print = function(value) {
  console.log(value);
}, Foo = function() {
  function Foo(x) {
    this.x = x;
  }
  return Foo.prototype.output = function() {
    print(this.x);
  }, Foo;
}();

console.log("esm-test: main.js"), new Foo(123).output();

export { Foo as Bar };
