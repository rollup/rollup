function fn$2 () {
  console.log('lib fn');
}

function fn$1 () {
  fn$2();
  console.log(text);
  text$1 = 'dep1 fn after dep2';
}

var text$1 = 'dep1 fn';

function fn () {
  console.log(text$1);
  text = 'dep2 fn after dep1';
}

var text = 'dep2 fn';

export { fn$1 as a, text$1 as b, fn as f, text as t };
