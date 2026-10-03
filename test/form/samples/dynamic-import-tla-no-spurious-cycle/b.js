await Promise.resolve();

export default class B {
async foo() {
const foo = await import('./foo2.js');
return new foo.Foo();
}
}
