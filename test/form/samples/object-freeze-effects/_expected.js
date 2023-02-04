const b = Object.freeze({ foo: 'bar' });
console.log(b);

const c = { foo: 'bar' };
Object.freeze(c); // retained
console.log(c);
