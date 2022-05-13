let funDeclEffect = false;
function funDecl() {}
Object.defineProperty(funDecl, 'foo', { get() { funDeclEffect = true; }});
funDecl.foo;
assert.ok(funDeclEffect, 'function declaration');

let funExpEffect = false;
const funExp = function () {};
Object.defineProperty(funExp, 'foo', { get() { funExpEffect = true }});
funExp.foo;
assert.ok(funExpEffect, 'function expression');

let arrowEffect = false;
const arrow = function () {};
Object.defineProperty(arrow, 'foo', { get() { arrowEffect = true }});
arrow.foo;
assert.ok(arrowEffect, 'arrow function');
