var a = 42;

export function change() {
  a++;
}

export default a;

// Any replacement for the `export default` above needs to happen in the same
// location. It cannot be done, say, at the end of the file. Otherwise the new
// value of `a` will be used and will be incorrect.
a = 0;
