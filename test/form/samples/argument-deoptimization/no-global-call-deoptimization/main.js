const obj = { foo: true, noEffect() {} };

console.log(obj);

// removed
obj.noEffect();

console.log(obj.foo ? 'OK' : 'FAIL');
