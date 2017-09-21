const removed1 = { x: () => {} };
removed1.x();

const retained1 = { x: () => {} };
retained1.y();

const retained2 = { x: () => {} };
retained2.x = {};
retained2.x();

const removed2 = { x: { y: () => {} } };
removed2.x.y = function () {};
removed2.x.y();

const retained3 = { x: { y: globalFunc } };
const retained4 = { x: { y: {} } };
retained4.x = retained3.x;
retained4.x.y();
