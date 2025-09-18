// Using dynamic imports for clearer expected output
const load = async () => {
  console.log(
    await import('./manual1').then((m) => m.manual1),
    await import('./manual2').then((m) => m.manual2),
  );
};
load();

console.log('main');