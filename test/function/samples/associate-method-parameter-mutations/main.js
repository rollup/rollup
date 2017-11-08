const foo = { noEffect: () => {} };
const bar = {};

function Baz () {}

Baz.prototype.addEffect = function ( obj ) {
	obj.noEffect = () => {
		bar.baz = 'present';
	};
};

const baz = new Baz();
baz.addEffect( foo );
foo.noEffect();

export default bar;
