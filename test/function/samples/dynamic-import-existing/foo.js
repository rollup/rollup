export var x = 42;
export var promise = import('./main').then(m => {
  return m.y * 2;
});
