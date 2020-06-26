var dep = { foo: 'bar' };
// This should log a global variable
console.log(foo);

var foo$1 = dep.foo;
export { foo$1 as foo };
