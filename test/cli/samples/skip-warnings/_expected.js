var b = { b: 2, get a() { return a.a; } };

var a = { a: 1, get b() { return b.b; } };

console.log(a);
console.log(b);