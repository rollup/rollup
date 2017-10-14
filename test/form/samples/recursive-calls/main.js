const removed1 = () => globalVar || removed1();
removed1();

const removed2 = () => globalVar ? () => removed2()() : () => {};
removed2()();

const removed3 = () => globalVar ? removed3() : {};
removed3().x = 3;

const removed4 = () => globalVar ? removed4() : { x: () => {} };
removed4().x();

const removed5 = {
	get x () {
		return globalVar || removed5.x;
	}
};
removed5.x;

const removed6 = {
	get x () {
		return globalVar ? removed6.x : () => {};
	}
};
removed6.x();

const removed7 = {
	get x () {
		return globalVar ? removed7.x : {};
	}
};
removed7.x.y = 7;

const removed8 = {
	get x () {
		return globalVar ? removed8.x : { y: () => {} };
	}
};
removed8.x.y();

const retained1 = () => globalVar ? retained1() : console.log( 'effect' );
retained1();

const retained2 = () => globalVar ? () => retained2()() : () => console.log( 'effect' );
retained2()();

const retained3 = () => globalVar ? retained3() : {};
retained3().x.y = 3;

const retained4 = () => globalVar ? retained4() : { x: () => console.log( 'effect' ) };
retained4().x();

const retained5 = {
	get x () {
		return globalVar ? retained5.x : console.log( 'effect' );
	}
};
retained5.x;

const retained6 = {
	get x () {
		return globalVar ? retained6.x : () => console.log( 'effect' );
	}
};
retained6.x();

const retained7 = {
	get x () {
		return globalVar ? retained7.x : {};
	}
};
retained7.x.y.z = 7;

const retained8 = {
	get x () {
		return globalVar ? retained8.x : { y: () => console.log( 'effect' ) };
	}
};
retained8.x.y();
