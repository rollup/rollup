var obj1 = obj1;
console.log(obj1.foo());

var obj2 = {foo: () => {}};
var obj2 = {foo: log};
obj2.foo();

var obj3 = {obj: obj3};
obj3.obj.obj.obj.obj.obj.obj.obj.obj.obj.foo();
