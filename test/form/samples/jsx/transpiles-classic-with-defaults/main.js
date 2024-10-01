const Foo = () => {};
const obj = { key: '2' };

console.log(<Foo />);
console.log(<><Foo/></>);
console.log(<Foo><Foo/><Foo/></Foo>);
console.log(<><Foo/><Foo/></>);
console.log(<Foo {...obj} key="1" />);
