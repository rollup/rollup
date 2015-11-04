export {default as foo} from './foo';
export var foo1 = typeof foo;
assert.equal(foo1, "undefined");
