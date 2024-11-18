const retained1 = { x: {} };
retained1.y = 1;
retained1.x.y = 2;

const retained2 = { };
retained2.y.z = 1;

const retained3 = { x: {} };
delete retained3.x;
retained3.x.y = 2;

const retained4 = { x: undefined };
retained4.x.y = 2;

const retained5 = { x: null };
retained5.x.y = 2;

const retained6 = { x: { y: {} } };
retained6.x = {};
retained6.x.y.z = 3;

const retained7 = { x: { y: globalThis.unknown } };
const retained8 = { x: retained7.x };
retained8.x.y.z = 3;

export { retained1 };
