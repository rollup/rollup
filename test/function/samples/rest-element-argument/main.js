let hasArg0 = false;
let hasArg1 = false;
let hasArg2 = false;

function foo(arg0, arg1, arg2) {
  if (arg0) {
    hasArg0 = true;
  }
  if (arg1) {
    hasArg1 = true;
  }
  if (arg2) {
    hasArg2 = true;
  }
}

foo(...['arg0', 'arg1']);

assert.equal(hasArg0, true);
assert.equal(hasArg1, true);
assert.equal(hasArg2, false);
