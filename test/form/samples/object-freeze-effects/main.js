Object.freeze({ foo: 'bar' }); // removed

const a = { foo: 'bar' }; // removed
Object.freeze(a); // removed

const b = Object.freeze({ foo: 'bar' });
console.log(b);

const c = { foo: 'bar' };
Object.freeze(c); // retained
console.log(c);
