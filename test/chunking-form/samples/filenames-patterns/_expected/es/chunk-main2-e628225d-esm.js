var dep = { x: 42 };

function log (x) {
  if (dep) {
    console.log(x);
  }
}

export { log as a, dep as b };
