const d = {
  fn: 42,
  hello: 'hola'
};

var ns = d;

var fn = d.fn;

var foo = d.foo;

console.log(fn);
console.log(foo);
console.log(ns);
