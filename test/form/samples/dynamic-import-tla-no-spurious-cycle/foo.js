import A from './a.js';
await Promise.resolve();

export default class Foo extends A {
async foo() {
const foo = await import('./foo2.js');
return new foo.Foo();
}
}
