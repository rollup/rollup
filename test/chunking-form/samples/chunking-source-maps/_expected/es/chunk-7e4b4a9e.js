function fn () {
  console.log('lib2 fn');
}

function fn$1 () {
  fn();
  console.log('dep2 fn');
}

export { fn$1 as fn };
//# sourceMappingURL=chunk-7e4b4a9e.js.map
