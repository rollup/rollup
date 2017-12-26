function fn () {
  console.log('lib fn');
}

function fn$1 () {
  fn();
  console.log(text$1);
}

var text$$1 = 'dep1 fn';

function fn$2 () {
  console.log(text$$1);
}

var text$1 = 'dep2 fn';

export { fn$2 as fn, fn$1 };
