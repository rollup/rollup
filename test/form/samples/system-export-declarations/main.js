// middle binding
const a1 = 1, a2 = 2, a3 = 3;
console.log(a1, a2, a3);
export { a2 };

// first binding
const b1 = 1, b2 = 2;
console.log(b1, b2);
export { b1 };

// last binding
const c1 = 1, c2 = 2;
console.log(c1, c2);
export { c2 };

// middle binding with other bindings removed
const d1 = 1, d2 = 2, d3 = 3;
export { d2 };

// uninitialized binding
let e1 = 1, e2, e3 = 3;
console.log(e1, e2, e3);
export { e2 };

// destructuring declaration
let {f1, f2} = globalThis.obj, {f3} = globalThis.obj;
export { f2 };
