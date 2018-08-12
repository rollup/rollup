var dep = { x: 42 };

function log (x) {
  if (dep) {
    console.log(x);
  }
}

export { dep as a, log as b };
