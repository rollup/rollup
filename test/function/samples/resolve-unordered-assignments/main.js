const foo1 = { noEffect: () => {} };
let foo2 = { noEffect: () => {} };
const bar = {};

assignFoo();
foo2.noEffect = () => {
	bar.baz = 'present';
};
foo1.noEffect();

function assignFoo () {
	foo2 = foo1;
}

export default bar;
