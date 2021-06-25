const obj = { flag: false };
var foo = obj;
foo.flag = true;
assert.ok(obj.flag ? true : false, 'init deoptimization');

assert.ok(bar ? false : true, 'value deoptimization');
var bar = true;
