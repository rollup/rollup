export default notActuallyFoo;

function notActuallyFoo () {
  return 'not ' + foo();
}

function foo () {
  return 'actually foo';
}
