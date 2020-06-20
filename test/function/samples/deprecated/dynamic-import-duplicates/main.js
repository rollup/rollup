export var x = 41;

export var promise = Promise.all([import('./foo'), import('./foo')]).then(foos => {
  return foos[0].x;
});
