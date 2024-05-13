const spread$2 = ['spread 1'];
console.log(spread$2);

const spread$1 = ['spread 2'];
console.log(spread$1);

const spread = ['spread 3'];
console.log(spread);

const Foo = () => {};
const element = <Foo>{...spread$1}</Foo>;
const fragment = <>{...spread$1}</>;

export { element, fragment };
