export var x = 41;

export var promise = import('./foo').then(foo => {
  return foo.x;
});
