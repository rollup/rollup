const a = <Foo key={123}/>
const b = <Foo key={123}/>
const c = <Foo a="1" key={123} b="2"/>
const d = <Foo a="1" key={123} b="2"/>
const e = <Foo key={123}/>;
const f = <Foo key={123}/>;
const g = <Foo a="1" key={123} b="2"/>;
const h = <Foo a="1" key={123} b="2"/>;
console.log(b,d,f,h);
