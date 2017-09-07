let a = {};
let b = a;
a = b;
a.foo = 1;
b = b;
b.foo = 1;

let c = () => {};
let d = c;
c = d;
c();
d = d;
d();
