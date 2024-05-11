const element$2 = 'element 1';
console.log(element$2);

const element$1 = 'element 2';
console.log(element$1);

const element = 'element 3';
console.log(element);

const Foo = () => {};
const result = <Foo>{'test' + element$1}</Foo>;

export { result };
