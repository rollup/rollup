
// should maintain this context
var module = {};
module.bar = function () { assert.notEqual(this, module); };
var h = (0, module.bar)();
