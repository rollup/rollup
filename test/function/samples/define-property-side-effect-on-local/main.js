const obj = {};
const local = (obj.a = {});
Object.defineProperty(local, 'b', { value: 42 });

assert.equal(obj.a.b, 42);
