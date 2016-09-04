export function square(x) {
  return x * x;
}

Object.defineProperty(square, "test", {
  get: function() { throw new Error('should not import square'); },
  set: function( arg ) {}
});
square.test();
