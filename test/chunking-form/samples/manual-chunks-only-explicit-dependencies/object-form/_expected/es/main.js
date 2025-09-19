// Using dynamic imports for clearer expected output
const load = async () => {
  console.log(
    await import('./generated-manual.js').then(function (n) { return n.m; }).then((m) => m.manual1),
    await import('./generated-manual.js').then(function (n) { return n.a; }).then((m) => m.manual2),
  );
};
load();

console.log('main');
