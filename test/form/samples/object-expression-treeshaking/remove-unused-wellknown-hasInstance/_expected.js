const obj1 = { [Symbol.hasInstance]: () => meow() };
const obj2 = { };
console.log(null instanceof obj1, obj2.z);
