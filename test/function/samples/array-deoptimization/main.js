const array = [true];

function test(){
  if (array[0] || false) {
    array.unshift(false);
  }
  assert.strictEqual(array[0] && true, false);
}

test()
test()
