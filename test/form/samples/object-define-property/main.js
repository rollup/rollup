const removed = {};
Object.defineProperty(removed, 'foo', { value: true });
Object.defineProperties(removed, { bar: { value: true } });

const retained1 = {};
Object.defineProperty(retained1, 'foo', { value: true });
console.log(retained1);

const retained2 = {};
Object.defineProperties(retained2, { bar: { value: true } });
console.log(retained2);

const removed2 = [];
Object.defineProperty(removed2, 'foo', { value: true });

class removed3 {}
Object.defineProperty(removed3, 'foo', { value: true });

function removed4() {}
Object.defineProperty(removed4, 'foo', { value: true });

const removed5 = () => {};
Object.defineProperty(removed5, 'foo', { value: true });
