const obj1 = { [Symbol.hasInstance]: () => true };
const obj2 = { };
console.log(null instanceof obj1, obj2.z);
