import foo from 'external';
console.log(foo, this);
export const bar = eval('foo');
