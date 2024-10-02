const obj$2 = { value1: true };
console.log(obj$2);

const obj$1 = { value2: true };
console.log(obj$1);

const obj = { value3: true };
console.log(obj);

const Foo = () => {};
const result1 = <Foo {...obj$1} />;
const result2 = <Foo {...obj$1} prop />;
const result3 = <Foo
  prop1
  prop2
  {...obj$1}
  {...obj$1}
/>;

export { result1, result2, result3 };
