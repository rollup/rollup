function foo() {
  return 'foo'
}

function bar() {
  dead();
}

function dead() {
  console.log('dead');
}

assert.equal( foo(), 'foo' );
