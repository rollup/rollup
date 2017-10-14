const removed1 = () => globalVar || removed1();
removed1();

const removed2 = () => () => globalVar || removed2()();
removed2()();

const removed3 = () => globalVar ? removed3() : {};
removed3().x = 3;

const removed4 = () => globalVar ? removed4() : { x: () => {} };
removed4().x();

const retained1 = () => globalVar ? retained1() : console.log( 'effect' );
retained1();

const retained2 = () => () => globalVar ? retained2()() : console.log( 'effect' );
retained2()();

const retained3 = () => globalVar ? retained3() : {};
retained3().x.y = 3;

const retained4 = () => globalVar ? retained4() : { x: () => console.log( 'effect' ) };
retained4().x();
