const retained1 = {};
Object.defineProperty(retained1, 'foo', { value: true });
console.log(retained1);

const retained2 = {};
Object.defineProperties(retained2, { bar: { value: true } });
console.log(retained2);
