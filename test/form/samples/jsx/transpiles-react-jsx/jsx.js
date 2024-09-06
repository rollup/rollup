const Foo = () => {};
const obj = { key: '2' };

// jsx
console.log(<Foo />);
console.log(<Foo x />);
console.log(<Foo x="1" />);
console.log(<Foo x={"1"} />);
console.log(<Foo key />);
console.log(<Foo key="1" />);
console.log(<Foo key={"1"} />);
console.log(<Foo {...obj} />);
console.log(<Foo {...obj} x="1" />);
console.log(<Foo key="1" {...obj} />);
console.log(<Foo key {...obj} />);
console.log(<Foo x="1" y="1" {...obj} {...obj} />);
console.log(<Foo x="1" key="1" y="1" {...obj} {...obj} />);
console.log(<Foo x="1" key y="1" {...obj} {...obj} />);

console.log(<Foo></Foo>);
console.log(<Foo x="1"></Foo>);
console.log(<Foo key="1"></Foo>);
console.log(<Foo key></Foo>);

console.log(<Foo><Foo/></Foo>);
console.log(<Foo x="1"><Foo/></Foo>);
console.log(<Foo key="1"><Foo/></Foo>);
console.log(<Foo key><Foo/></Foo>);
console.log(<Foo {...obj} ><Foo/></Foo>);
console.log(<Foo {...obj} x="1" ><Foo/></Foo>);
console.log(<Foo key="1" {...obj} ><Foo/></Foo>);
console.log(<Foo key {...obj} ><Foo/></Foo>);
console.log(<Foo x="1" y="1" {...obj} {...obj} ><Foo/></Foo>);
console.log(<Foo x="1" key="1" y="1" {...obj} {...obj} ><Foo/></Foo>);
console.log(<Foo x="1" key y="1" {...obj} {...obj} ><Foo/></Foo>);

console.log(<Foo>{/* comment */}<Foo/>{/* comment */}</Foo>);

console.log(<></>);
console.log(<><Foo/></>);

// jsxs
console.log(<Foo><Foo/><Foo/></Foo>);
console.log(<Foo x="1"><Foo/><Foo/></Foo>);
console.log(<Foo key="1"><Foo/><Foo/></Foo>);
console.log(<Foo key><Foo/><Foo/></Foo>);
console.log(<Foo {...obj} ><Foo/><Foo/></Foo>);
console.log(<Foo {...obj} x="1" ><Foo/><Foo/></Foo>);
console.log(<Foo key="1" {...obj} ><Foo/><Foo/></Foo>);
console.log(<Foo key {...obj} ><Foo/><Foo/></Foo>);
console.log(<Foo x="1" y="1" {...obj} {...obj} ><Foo/><Foo/></Foo>);
console.log(<Foo x="1" key="1" y="1" {...obj} {...obj} ><Foo/><Foo/></Foo>);
console.log(<Foo x="1" key y="1" {...obj} {...obj} ><Foo/><Foo/></Foo>);

console.log(<><Foo/><Foo/></>);

// createElement
console.log(<Foo {...obj} key="1" />);
console.log(<Foo {...obj} key />);
console.log(<Foo {...obj} {...obj} x="1" key="1" y="1" />);
console.log(<Foo {...obj} {...obj} x="1" key y="1" />);
console.log(<Foo {...obj} key="1"></Foo>);
console.log(<Foo {...obj} key="1"><Foo/></Foo>);
