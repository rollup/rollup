const foo = { noEffect: () => {} };
const bar = {};

function addEffect ( obj ) {
	obj.noEffect = () => {
		bar.baz = 'present';
	};
}

addEffect( foo );
foo.noEffect();

export default bar;
