await Promise.resolve();

class B {
async foo() {
const foo = await Promise.resolve().then(function () { return foo2; });
return new foo.Foo();
}
}

class A extends B {}

await Promise.resolve();

let Foo$1 = class Foo extends A {
async foo() {
const foo = await Promise.resolve().then(function () { return foo2; });
return new foo.Foo();
}
};

class Bar extends A {
bar() {
return new Foo$1().foo();
}
}

new Bar().bar();

class Foo extends A {
foo() { console.log('hello'); }
}

var foo2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Foo: Foo
});
