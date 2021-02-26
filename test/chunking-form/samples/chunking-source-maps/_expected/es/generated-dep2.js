function fn$1 () {
  console.log('lib2 fn');
}

function fn () {
  fn$1();
  console.log('dep2 fn');
}

export { fn as f };
//# sourceMappingURL=generated-dep2.js.map
