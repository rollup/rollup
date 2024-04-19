function f(a) {
  assert.equal(a ? 'OK' : 'FAIL', 'OK');
  a = false;
  assert.equal(a ? 'FAIL' : 'OK', 'OK');
}

f(true)
