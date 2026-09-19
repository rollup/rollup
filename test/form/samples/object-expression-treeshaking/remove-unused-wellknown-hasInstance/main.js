const obj1 = { [Symbol.hasInstance]: () => meow() };
const obj2 = { [Symbol.hasInstance]: () => meow() };
console.log(null instanceof obj1, obj2.z);
