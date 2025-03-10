var obj1 = obj1;
console.log(obj1.foo());

var obj2 = { obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {}}}}}}}}}}};
obj2.obj.obj.obj.obj.obj.obj.obj.foo();

var obj3 = { obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {}}}}}}}}}}};
if (obj3.obj.obj.obj.obj.obj.obj.obj.obj.foo) console.log('nested');

var obj4 = { obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {obj: {}}}}}}}}}}};
obj4.obj.obj.obj.obj.obj.obj.obj.foo = 'nested';
