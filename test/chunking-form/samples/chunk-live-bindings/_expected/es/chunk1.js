function fn () {
  console.log('lib fn');
}

function fn$1 () {
  fn();
  console.log(text$1);
  text = 'dep1 fn after dep2';
}

var text = 'dep1 fn';

function fn$2 () {
  console.log(text);
  text$1 = 'dep2 fn after dep1';
}

var text$1 = 'dep2 fn';

export { fn$2 as a, text$1 as b, fn$1 as c, text as d };
