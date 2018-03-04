var dep = { x: 42 }

function log (x) {
  if (dep) {
    console.log(x);
  }
}

export default log;
export { dep as default$1 };
