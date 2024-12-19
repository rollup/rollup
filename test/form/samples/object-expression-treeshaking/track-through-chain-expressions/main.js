const a = { b: { c: 1, removed: true }, removed: true };
const b = a?.b;
console.log(b?.c);
